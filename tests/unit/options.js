(function($){

	module("options");

	test("noneSelectedText", function(){
		expect(7);
		var text;
		
		el = $("select").multiselect({
			noneSelectedText: 'None Selected'
		});
		
		// read from widget
		text = el.multiselect("option", "noneSelectedText");
		
		equals( button().text(), text, 'on init, button reads "None Selected"');
		el.multiselect("checkAll");
		ok( button().text() !== text, 'after checkAll, button no longer reads "None Selected"');
		el.multiselect("uncheckAll");
		equals( button().text(), text, 'after uncheckAll, button text restored to "None Selected"');
		
		// change the option value
		el.multiselect("option", "noneSelectedText", "No Checkboxes Checked");
		equals( el.multiselect("option", "noneSelectedText"), "No Checkboxes Checked", "new noneSelectedText value set correctly");
		
		// read updated value from widget
		text = el.multiselect("option", "noneSelectedText");
		
		// test against the new value
		equals( button().text(), text, 'after changing the option value, button now reads "No Checkboxes Checked"');
		el.multiselect("checkAll");
		ok( button().text() !== text, 'after checkAll, button no longer reads "No Checkboxes Checked"');
		el.multiselect("uncheckAll");
		equals( button().text(), text, 'after uncheckAll, button text restored to "No Checkboxes Checked"');
		
		el.multiselect("destroy");
	});

	test("selectedText", function(){
		expect(3);
		var numOptions = $("select option").length;
		
		el = $("select").multiselect({
			selectedText: '# of # selected'
		});
		
		el.multiselect("checkAll");
		equals( button().text(), numOptions+' of '+numOptions+' selected', 'after checkAll, button reflects the total number of checked boxes');
		
		// change option value
		el.multiselect("option","selectedText", function( numChecked ){
			return numChecked + ' options selected';
		});
		
		equals( button().text(), numOptions+' options selected', 'after changing the option to a function value, button reflects the new text');
		
		// uncheck all
		el.multiselect("uncheckAll");
		equals( button().text(), el.multiselect("option","noneSelectedText"), 'after unchecking all, button text now reflects noneSelectedText option value');
		
		el.multiselect("destroy");
	});

	test("height", function(){
		expect(2);
		
		var height = 234;
		
		el = $("select").multiselect({ height: height }).multiselect("open");
		equals( height, widget().find("ul.ui-multiselect-checkboxes").height(), 'height after opening propertly set to '+height );
		
		// change height and re-test
		height = 333;
		el.multiselect("option", "height", height);
		equals( height, widget().find("ul.ui-multiselect-checkboxes").height(), 'changing value through api to '+height );
		
		el.multiselect("destroy");
	});

	test("minWidth", function(){
		expect(3);
		
		var minWidth = 321;
		
		el = $("select").multiselect({ minWidth:minWidth }).multiselect("open");
		equals( minWidth, button().outerWidth(), 'outerWidth of button is '+minWidth );
		
		// change height and re-test
		minWidth = 351;
		el.multiselect("option", "minWidth", minWidth);
		equals( minWidth, button().outerWidth(), 'changing value through api to '+minWidth);
		
		// change height to something that should fail.
		minWidth = 10;
		el.multiselect("option", "minWidth", minWidth);
		var outerWidth = button().outerWidth();
		ok( minWidth !== outerWidth, 'changing value through api to '+minWidth+' (too small), outerWidth is actually ' + outerWidth);
		
		el.multiselect("destroy");
	});

	test("checkAllText", function(){
		expect(2);
		var text = "foo";
		
		el = $("select").multiselect({ checkAllText:text });
		equals( text, widget().find(".ui-multiselect-all").text(), 'check all link reads '+text );
		
		// set through option
		text = "bar";
		el.multiselect("option","checkAllText","bar");
		equals( text, widget().find(".ui-multiselect-all").text(), 'check all link reads '+text );
		
		el.multiselect("destroy");
	});

	test("uncheckAllText", function(){
		expect(2);
		var text = "foo";
		
		el = $("select").multiselect({ uncheckAllText:text });
		equals( text, widget().find(".ui-multiselect-none").text(), 'check all link reads '+text );
		
		// set through option
		text = "bar";
		el.multiselect("option","uncheckAllText","bar");
		equals( text, widget().find(".ui-multiselect-none").text(), 'changing value through api to '+text );
		
		el.multiselect("destroy");
	});

	test("autoOpen", function(){
		expect(2);
		
		el = $("select").multiselect({ autoOpen:false });
		ok( menu().is(":hidden"), 'menu is hidden with autoOpen off');
		el.multiselect("destroy");
		
		el = $("select").multiselect({ autoOpen:true });
		ok( menu().is(":visible"), 'menu is visible with autoOpen on');
		el.multiselect("destroy");
		
		// no built in support for change on the fly; not testing it.
	});
	
	test("multiple", function(){
		expect(6);
		
		el = $("select").multiselect({ multiple:false });
		ok( !widget().find(":checkbox").length, 'no checkboxes are present');
		ok( widget().find(":radio").length > 0, 'but radio boxes are');
		
		// simulate click on ALL radios
		var radios = widget().find("input:radio").trigger("click");
		
		// at the end of that, only one radio should be checked
		equals( radios.filter(":checked").length, 1, 'After checking all radios, only one is actually checked');
		
		// uncheck boxes... should only be one
		radios.filter(":checked").removeAttr("checked");
		
		// method calls
		el.multiselect("checkAll");
		equals( widget().find("input:radio:checked").length, 1, 'After checkAll method call only one is actually checked');
		
		//console.log( widget().find("input:radio:checked"));
		el.multiselect("uncheckAll");
		equals( widget().find("input:radio:checked").length, 0, 'After uncheckAll method nothing is checked');

		// check/uncheck all links
		equals( widget().find(".ui-multiselect-all, ui-multiselect-none").length, 0, "Check/uncheck all links don't exist");
		
		// not testing change on the fly here - IE doesn't support that.
		
		el.multiselect("destroy");
	});

	test("classes", function(){
		expect(6);
		
		var classname = 'foo';
		
		el = $("select").multiselect({ classes:classname });
		equals( widget().hasClass(classname), true, 'menu has the class ' + classname);
		equals( button().hasClass(classname), true, 'button has the class ' + classname);
		
		// change it up
		var newclass = 'bar';
		el.multiselect("option", "classes", newclass);
		equals( widget().hasClass(newclass), true, 'menu has the new class ' + newclass);
		equals( button().hasClass(newclass), true, 'button has the new class ' + newclass);
		equals( button().hasClass(classname), false, 'menu no longer has the class ' + classname);
		equals( button().hasClass(classname), false, 'button no longer has the class ' + classname);
	});
	
})(jQuery);