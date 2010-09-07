var el;

function widget(){
	return el.multiselect("widget");
}

function button(){
	return el.next();
}

function menu(){
	return button().next();
}


(function($){

	module("core");

	test("init", function(){
		expect(1);
	 
		el = $("select").multiselect();
			ok( el.is(":hidden"), 'Original select is hidden');
		el.multiselect("destroy");
	});
	
})(jQuery);
