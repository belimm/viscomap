$(function() { 
    $('tr.parent td span.btn')
      .on("click", function(){
      var idOfParent = $(this).parents('tr').attr('id');
      $('tr.'+idOfParent).toggle('slow');
    });
    $('tr[class^=]').hide().children('td');
  });