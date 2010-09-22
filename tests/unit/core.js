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

	test("form submission", function(){
		expect(3);
		
		var form = $('<form></form>'), data;
		
		el = $('<select name="test" multiple="multiple"><option value="foo" selected="selected">foo</option><option value="bar">bar</option></select>')
			.appendTo(form)
			.multiselect()
			.multiselect("checkAll");
			
		// this test ensures that the underlying option tags weren't serialized as well
		data = form.serialize();
		ok( data === 'test=foo&test=bar', 'after checking all and serializing the form, the correct keys were serialized: ' + data);
		
		el.multiselect("uncheckAll");
		data = form.serialize();
		ok( !data.length, 'after unchecking all and serializing the form, nothing was serialized: ' + data);
		
		// re-check all and destroy, exposing original select
		el.multiselect("checkAll").multiselect("destroy");
		data = form.serialize();
		ok( data === 'test=foo&test=bar', 'after checking all, destroying the widget, and serializing the form, the correct keys were serialized: ' + data);
	});
	
})(jQuery);
