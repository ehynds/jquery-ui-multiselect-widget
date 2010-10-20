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
	
	asyncTest("form reset, nothing pre-selected", function(){
		expect(2);
		
		var form = $('<form></form'),
			noneSelected = 'Please check something';
		
		el = $('<select name="test" multiple="multiple"><option value="foo">foo</option><option value="bar">bar</option></select>')
			.appendTo(form)
			.multiselect({ noneSelectedText: noneSelected })
			.multiselect("checkAll");
			
		// trigger reset
		form.trigger("reset");
		
		setTimeout(function(){
			equals( menu().find(":checked").length, 0, "no checked checkboxes" );
			equals( button().text(), noneSelected, "none selected text");
			start();
		}, 1);
	});
	
	asyncTest("form reset, pre-selected options", function(){
		expect(2);
		
		var form = $('<form></form');
		
		el = $('<select name="test" multiple="multiple"><option value="foo" selected="selected">foo</option><option value="bar" selected="selected">bar</option></select>')
			.appendTo(form)
			.multiselect({ selectedText: '# of # selected' });
			
		// trigger reset
		form.trigger("reset");
		
		setTimeout(function(){
			equals( menu().find(":checked").length, 2, "two checked checkboxes" );
			equals( button().text(), '2 of 2 selected', "selected text" );
			start();
		}, 1);
	});
})(jQuery);
