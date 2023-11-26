//VARIÁVEIS GLOBAIS A SER IMPORTADAS PARA OS VÁRIOS FICHEIROS
const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 550 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom,
    colorMarcados = "#6ba3f3",
    colorRealizados = "#003785",
    colorAprovados = "#66C28BFF",
    colorReprovados = "#FC6762FF",
    colorMasculino = "#01dfff",
    colorFeminino = "#C470E8D8";




let currentYear = "2015"; //current selected year across pages
let passMode = true; // current selected mode. true: Approval, false: Failure

//util for percentages
function roundToTwoDecimalPlaces(number) {
    return parseFloat(number.toFixed(2));
}
