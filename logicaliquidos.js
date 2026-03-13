// =========================================================
// FUNÇÃO PARA NORMALIZAR TEXTO
// =========================================================
function normalizarTexto(txt) {
  return txt
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// =========================================================
// TABELA + FUNÇÃO PARA CÁLCULO DE GOTAS → mL
// =========================================================
function calcularGotas(medicamento, gotasPorDia, dias) {
  const gotasporMl = {
    daforin: 20,
    dogmatil: 20,
    exodus: 20,
    haldol: 20,
    reconter: 20,

    anestesico: 22,
    maxitrol: 22,

    lexotan: 25,
    rivotril: 25,

    ciclopegico: 30,
    anestalcon: 30,

    tobrex: 33,

    amplictil: 40,
    gardenal: 40,
    neozine: 40,
    neuleptil: 40,
    tramal: 40
  };

  const nomeNormalizado = normalizarTexto(medicamento);
  const gpm = gotasporMl[nomeNormalizado];

  if (!gpm) {
    return { erro: "❌ Medicamento não está na tabela de gotas por mL." };
  }

  const mlTotal = (gotasPorDia * dias) / gpm;

  return { mlTotal };
}

// =========================================================
// CONFIGURAÇÃO INICIAL
// =========================================================
window.onload = function () {
  const resultadoBox = document.getElementById("caixa-resultado");
  resultadoBox.innerHTML = `
  ⚠️ Verifique se a receita tem restrição de caixas/comprimidos ou se é uso contínuo.⚠️<br>
  ⚠️ Se o medicamento for similar, verifique se ele é intercambiável com o de referência.⚠️
  `;

  const radios = document.querySelectorAll('input[name="tipo-de-uso"]');
  radios.forEach((r) => r.addEventListener("change", atualizarCampoDias));

  atualizarCampoDias();

  document.getElementById("botao-calcular").addEventListener("click", calcular);
};

// =========================================================
// HABILITAR/DESABILITAR CAMPO DE DIAS
// =========================================================
function atualizarCampoDias() {
  const campoDias = document.getElementById("por-quantos-dias");
  const radioSelecionado = document.querySelector(
    'input[name="tipo-de-uso"]:checked'
  );

  if (radioSelecionado && radioSelecionado.value === "uso-continuo") {
    campoDias.disabled = true;
    campoDias.value = "";
    campoDias.style.backgroundColor = "#212122";
    campoDias.placeholder = "Desabilitado para uso contínuo";
  } else {
    campoDias.disabled = false;
    campoDias.style.backgroundColor = "#0fd7ff";
    campoDias.placeholder = "Ex: 30";
  }
}

// =========================================================
// MODIFICAR TEXTO DO INPUT CONFORME TIPO DE CÁLCULO
// =========================================================
document.addEventListener("DOMContentLoaded", function () {
  const tipoCalculo = document.getElementById("tipo-calculo");
  const textoQuantidade = document.getElementById("texto-quantidade");

  tipoCalculo.addEventListener("change", function () {
    let label = "Informe a quantidade por dia:";
    if (tipoCalculo.value === "Para Mls") label = "Quantos mLs por dia?";
    if (tipoCalculo.value === "Para Gotas") label = "Quantas gotas por dia?";
    if (tipoCalculo.value === "Para Unidades") label = "Quantas unidades (UI) por dia?";

    textoQuantidade.innerHTML =
      `${label}<br><br><input type="number" id="medicamento">`;
  });
});

// =========================================================
// FUNÇÃO PRINCIPAL — CALCULAR TUDO
// =========================================================
function calcular() {
  const resultado = document.getElementById("caixa-resultado");

  const nome = document.getElementById("nomeMedicamento").value.trim();
  const quantidadePorDia = Number(document.getElementById("medicamento").value);
  const diasCampo = document.getElementById("por-quantos-dias");
  const tipoReceita = document.getElementById("receituario").value;
  const tipoCalculo = document.getElementById("tipo-calculo").value;

  const radio = document.querySelector('input[name="tipo-de-uso"]:checked');

  if (!radio) {
    resultado.innerHTML =
      "❌ Selecione se é <strong>Uso contínuo</strong> ou <strong>Médico estipulou dias</strong>.";
    return;
  }

  const tipoUso = radio.value;

  if (!nome) {
    resultado.innerHTML = "❌ Informe o nome do medicamento.";
    return;
  }

  if (!quantidadePorDia || quantidadePorDia <= 0) {
    resultado.innerHTML = "❌ Informe corretamente a quantidade por dia.";
    return;
  }

  const nomeNormalizado = normalizarTexto(nome);

  // =========================================================
  //                 USO CONTÍNUO
  // =========================================================
  if (tipoUso === "uso-continuo") {
    let limiteDias = null;

    switch (tipoReceita) {
      case "amarela": limiteDias = 30; break;
      case "azul": limiteDias = 60; break;
      case "branca-antibiotico": limiteDias = 90; break;
      case "branca-psicotropico": limiteDias = 60; break;
      case "branca": limiteDias = 180; break;
    }

    // --- Gotas ---
    if (tipoCalculo === "Para Gotas") {
      const r = calcularGotas(nomeNormalizado, quantidadePorDia, limiteDias);
      if (r.erro) return resultado.innerHTML = r.erro;

      return (resultado.innerHTML = `
        ✅ Uso contínuo — máximo <strong>${limiteDias} dias</strong><br>
        O paciente precisa de <strong>${r.mlTotal.toFixed(2)} mL</strong>.
      `);
    }

    // --- Insulina (UI → mL) ---
    if (tipoCalculo === "Para Unidades") {
      const mlTotal = (quantidadePorDia * limiteDias) / 100; // 100 UI = 1 mL

      return (resultado.innerHTML = `
        ✅ Uso contínuo — máximo <strong>${limiteDias} dias</strong><br>
        O paciente precisa de <strong>${mlTotal.toFixed(2)} mL</strong> de insulina.
      `);
    }

    // --- mLs diretos ---
    if (tipoCalculo === "Para Mls") {
      const mlTotal = quantidadePorDia * limiteDias;

      return (resultado.innerHTML = `
        ✅ Uso contínuo — máximo <strong>${limiteDias} dias</strong><br>
        O paciente precisa de <strong>${mlTotal.toFixed(2)} mL</strong>.
      `);
    }

    // --- Comprimidos ---
    const total = quantidadePorDia * limiteDias;

    return (resultado.innerHTML = `
      ✅ Uso contínuo — <strong>${limiteDias} dias</strong><br>
      Total: <strong>${total}</strong> comprimidos.
    `);
  }

  // =========================================================
  //        MÉDICO ESTIPULOU DIAS
  // =========================================================
  const dias = Number(diasCampo.value);

  if (!dias || dias <= 0) {
    resultado.innerHTML = "❌ Informe quantos dias o médico estipulou.";
    return;
  }

  // --- Gotas ---
  if (tipoCalculo === "Para Gotas") {
    const r = calcularGotas(nomeNormalizado, quantidadePorDia, dias);
    if (r.erro) return resultado.innerHTML = r.erro;

    return (resultado.innerHTML = `
      🧑🏻‍⚕️ Médico estipulou <strong>${dias}</strong> dias.<br>
      O paciente precisa de <strong>${r.mlTotal.toFixed(2)} mL</strong>.
    `);
  }

  // --- Insulina ---
  if (tipoCalculo === "Para Unidades") {
    const mlTotal = (quantidadePorDia * dias) / 100;

    return (resultado.innerHTML = `
      🧑🏻‍⚕️ Médico estipulou <strong>${dias}</strong> dias.<br>
      O paciente precisa de <strong>${mlTotal.toFixed(2)} mL</strong>.
    `);
  }

  // --- mLs diretos ---
  if (tipoCalculo === "Para Mls") {
    const mlTotal = quantidadePorDia * dias;

    return (resultado.innerHTML = `
      🧑🏻‍⚕️ Médico estipulou <strong>${dias}</strong> dias.<br>
      O paciente precisa de <strong>${mlTotal.toFixed(2)} mL</strong>.
    `);
  }

  // --- Comprimidos ---
  const totalDispensar = quantidadePorDia * dias;

  resultado.innerHTML = `
    🧑🏻‍⚕️ Médico estipulou <strong>${dias}</strong> dias.<br>
    Total: <strong>${totalDispensar}</strong> comprimidos.
  `;
}
