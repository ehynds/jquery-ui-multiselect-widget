var el;

function widget(){
	return el.multiselect("widget");
}

function menu(){
	return el.next().next();
}

(function($){

	module("multiselect", "core");

	test("init", function(){
		expect(1);
	 
		el = $("select").multiselect();
			ok( el.is(":hidden"), 'Original select is hidden');
		el.multiselect("destroy");
	});

})(jQuery);
