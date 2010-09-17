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
		
		ok( button().text() === text, 'on init, button reads "None Selected"');
		el.multiselect("checkAll");
		ok( button().text() !== text, 'after checkAll, button no longer reads "None Selected"');
		el.multiselect("uncheckAll");
		ok( button().text() === text, 'after uncheckAll, button text restored to "None Selected"');
		
		// change the option value
		el.multiselect("option", "noneSelectedText", "No Checkboxes Checked");
		ok( el.multiselect("option", "noneSelectedText") === "No Checkboxes Checked", "new noneSelectedText value set correctly");
		
		// read updated value from widget
		text = el.multiselect("option", "noneSelectedText");
		
		// test against the new value
		ok( button().text() === text, 'after changing the option value, button now reads "No Checkboxes Checked"');
		el.multiselect("checkAll");
		ok( button().text() !== text, 'after checkAll, button no longer reads "No Checkboxes Checked"');
		el.multiselect("uncheckAll");
		ok( button().text() === text, 'after uncheckAll, button text restored to "No Checkboxes Checked"');
		
		el.multiselect("destroy");
	});

	test("selectedText", function(){
		expect(3);
		var numOptions = $("select option").length;
		
		el = $("select").multiselect({
			selectedText: '# of # selected'
		});
		
		el.multiselect("checkAll");
		ok( button().text() === numOptions+' of '+numOptions+' selected', 'after checkAll, button reflects the total number of checked boxes');
		
		// change option value
		el.multiselect("option","selectedText", function( numChecked ){
			return numChecked + ' options selected';
		});
		
		ok( button().text() === numOptions+' options selected', 'after changing the option to a function value, button reflects the new text');
		
		// uncheck all
		el.multiselect("uncheckAll");
		ok( button().text() === el.multiselect("option","noneSelectedText"), 'after unchecking all, button text now reflects noneSelectedText option value');
		
		el.multiselect("destroy");
	});

	test("height", function(){
		expect(2);
		
		var height = 234;
		
		el = $("select").multiselect({ height: height }).multiselect("open");
		ok( height === widget().find("ul.ui-multiselect-checkboxes").height(), 'height after opening propertly set to '+height );
		
		// change height and re-test
		height = 333;
		el.multiselect("option", "height", height);
		ok( height === widget().find("ul.ui-multiselect-checkboxes").height(), 'changing value through api to '+height );
		
		el.multiselect("destroy");
	});

	test("minWidth", function(){
		expect(3);
		
		var minWidth = 321;
		
		el = $("select").multiselect({ minWidth:minWidth }).multiselect("open");
		ok( minWidth === button().outerWidth(), 'outerWidth of button is '+minWidth );
		
		// change height and re-test
		minWidth = 351;
		el.multiselect("option", "minWidth", minWidth);
		ok( minWidth === button().outerWidth(), 'changing value through api to '+minWidth);
		
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
		ok( text === widget().find(".ui-multiselect-all").text(), 'check all link reads '+text );
		
		// set through option
		text = "bar";
		el.multiselect("option","checkAllText","bar");
		ok( text === widget().find(".ui-multiselect-all").text(), 'check all link reads '+text );
		
		el.multiselect("destroy");
	});

	test("uncheckAllText", function(){
		expect(2);
		var text = "foo";
		
		el = $("select").multiselect({ uncheckAllText:text });
		ok( text === widget().find(".ui-multiselect-none").text(), 'check all link reads '+text );
		
		// set through option
		text = "bar";
		el.multiselect("option","uncheckAllText","bar");
		ok( text === widget().find(".ui-multiselect-none").text(), 'changing value through api to '+text );
		
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
		expect(2);
		
		el = $("select").multiselect({ multiple:false });
		ok( !widget().find(":checkbox").length, 'no checkboxes are present');
		ok( widget().find(":radio").length > 0, 'but radio boxes are');
		
		// not testing change on the fly here - IE doesn't support that.
		
		el.multiselect("destroy");
	});
	
})(jQuery);