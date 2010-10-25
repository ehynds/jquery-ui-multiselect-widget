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
		
		el = $('<select id="test" name="test" multiple="multiple"><option value="foo" selected="selected">foo</option><option value="bar">bar</option></select>')
			.appendTo(form)
			.multiselect()
			.multiselect("checkAll");
			
		data = form.serialize();
		equals( data, 'test=foo&test=bar&multiselect_test=foo&multiselect_test=bar', 'after checking all and serializing the form, the correct keys were serialized');
		
		el.multiselect("uncheckAll");
		data = form.serialize();
		console.log(data);
		equals( data.length, 0, 'after unchecking all and serializing the form, nothing was serialized');
		
		// re-check all and destroy, exposing original select
		el.multiselect("checkAll").multiselect("destroy");
		data = form.serialize();
		equals( data, 'test=foo&test=bar', 'after checking all, destroying the widget, and serializing the form, the correct keys were serialized');
	});

	test("form submission, single select", function(){
		expect(7);
		
		var form = $('<form></form>').appendTo("body"), radios, data;
		
		el = $('<select id="test" name="test" multiple="multiple"><option value="foo">foo</option><option value="bar">bar</option><option value="baz">baz</option></select>')
			.appendTo(form)
			.multiselect({ multiple:false });
		
		// select multiple radios to ensure that, in the underlying select, only one
		// will remain selected
		radios = menu().find(":radio");
		radios[0].click();
		radios[2].click();
		radios[1].click();
		
		data = form.serialize();
		equals( data, 'test=bar&multiselect_test=bar', 'the form serializes correctly after clicking on multiple radio buttons');
		equals( radios.filter(":checked").length, 1, 'Only one radio button is selected');
		
		// uncheckAll method
		el.multiselect("uncheckAll");
		data = form.serialize();
		equals( data.length, 0, 'After unchecking all, nothing was serialized');
		equals( radios.filter(":checked").length, 0, 'No radio buttons are selected');
		
		// checkAll method
		el.multiselect("checkAll");
		data = form.serialize();
		equals( el.multiselect("getChecked").length, 1, 'After checkAll, only one radio is selected');
		equals( radios.filter(":checked").length, 1, 'One radio is selected');
		
		// expose original
		el.multiselect("destroy");
		data = form.serialize();
		equals( data, 'test=foo&test=bar&test=baz', 'after destroying the widget and serializing the form, the correct key was serialized: ' + data);
		
		el.remove()
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
