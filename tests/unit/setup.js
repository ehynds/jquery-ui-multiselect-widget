var el;
var body = document.body;

function button(){
   return el.next();
}

function menu(){
   return el.multiselect("widget");
}

function header(){
   return menu().find('.ui-multiselect-header');
}