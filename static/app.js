window.setTimeout(function() {
    $(".alert").fadeTo(500, 0) 
}, 4000);

var dataTable;
var projectTable;

$(document).ready(function (){
    $('#welcomeModal').modal('show')
 });

$(document).ready( function () {
    $('#DT_load').DataTable();
} );


$(document).ready(function () {
    loadDataTablee();
});

function loadDataTable() {
    dataTable = $('#DT_load').DataTable({
        "columns": [
            { "data": "Project Name", "width": "15%"},
            { "data": "Complexity Score", "width": "15%"}
        ],
        "language": {
            "emptyTable": "No data found"
        },
        "width": "500%"
    });
}

function loadDataTablee() {
    projectTable = $('#projectTable').DataTable({
        "columns": [
            { "data": "ID", "width": "2%"},
            { "data": "Sub URL", "width": "2%"},
            { "data": "Complexity Score", "width": "2%"},
            { "data": "Complexity Range", "width": "2%"}
        ],
        "language": {
            "emptyTable": "No data found"
        },
        "width": "100%"
    });
}