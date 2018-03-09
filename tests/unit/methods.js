(function($){

   QUnit.module("methods");

   QUnit.test("open", function(assert){
      el = $("select").multiselect().multiselect("open");
         assert.ok( el.multiselect("isOpen"), "isOpen parameter true" );
         assert.equal( menu().css("display"), "block", "Test display CSS property" );
      el.multiselect("destroy");
   });

   QUnit.test("close", function(assert){
      el = $("select").multiselect().multiselect("open").multiselect("close");
         assert.ok( !el.multiselect("isOpen"), "isOpen parameter false" );
         assert.equal( menu().css("display"), "none", "Test display CSS property" );
      el.multiselect("destroy");
   });

   QUnit.test("enable", function(assert){
      el = $("select").multiselect().multiselect("disable").multiselect("enable");
         assert.ok( button().is(":disabled") === false, "Button is enabled" );
         assert.ok( el.is(":disabled") === false, "Original select is enabled" );
      el.multiselect("destroy");
   });

   QUnit.test("disable", function(assert){
      // clone this one so the original is not affected
      el = $("select").clone(true).appendTo(body).multiselect().multiselect("disable");
         assert.ok( button().is(":disabled"), 'Button is disabled');
         assert.ok( el.is(":disabled"), 'Original select is disabled');
      el.multiselect("destroy").remove();
   });

   QUnit.test("enabling w/ pre-disabled tags (#216)", function(assert){
      el = $('<select><option disabled value="foo">foo</option><option value="bar">bar</option>')
         .appendTo(document.body)
         .multiselect();

      var boxes = menu().find("input");
      var disabled = boxes.first();
      var enabled = boxes.last();
      var msDisabledClass = "ui-multiselect-disabled";

      assert.equal(disabled.is(":disabled"), true, "The first option is disabled");
      el.multiselect("disable");
      assert.equal(disabled.hasClass(msDisabledClass), false, "After disabling the widget, the pre-disabled option is not flagged to re-enable");
      assert.equal(enabled.hasClass(msDisabledClass), true, "and the enabled option is flagged to be re-enable");
      el.multiselect("enable");
      assert.equal(disabled.is(":disabled"), true, "After enabling, the first option is still disabled");
      assert.equal(disabled.hasClass(msDisabledClass), false, "and the option no longer has the stored data flag");
      el.multiselect("destroy").remove();
   });

   QUnit.test("widget", function(assert){
      el = $("select").multiselect();
         assert.ok( menu().is("div.ui-multiselect-menu"), 'Widget is the menu element');
      el.multiselect("destroy");
   });

   QUnit.test("getButton", function(assert){
      el = $("select").multiselect();
      var button = el.multiselect("getButton");
         assert.ok( button.is("button.ui-multiselect"), 'Button is the button element');
      el.multiselect("destroy");
   });

   QUnit.test("getMenu", function(assert){
      el = $("select").multiselect();
      var menu = el.multiselect("getMenu");
      assert.ok( menu.is(".ui-multiselect-menu"), 'Menu is the menu element');
      el.multiselect("destroy");
   });

   QUnit.test("getLabels", function(assert){
      el = $("select").multiselect();
      var labels = el.multiselect("getLabels");
      assert.ok(labels.length === $(".ui-multiselect-menu label").length, 'Returns all the labels');
      el.multiselect("destroy");
   });

   QUnit.test("getCollapsed", function(assert){
      el = $("select").multiselect().multiselect('collapseAll');
      var collapsed = el.multiselect("getCollapsed");
      assert.equal(el.multiselect("getCollapsed").length, menu().find('.ui-multiselect-collapsed').length, 'Returns all the collapsed option groups');
      el.multiselect("destroy");
   });

   QUnit.test("addOption", function(assert) {
      el = $("select").clone().appendTo(body).multiselect();
      var attrs = {title: "Test Title", value: "newOption"};
      el.multiselect("addOption", attrs, "Option New");
      assert.ok(el.find("option[value=newOption]").length === 1, "The option is added to the source element");
      assert.ok(menu().find("input[value=newOption]").length === 1, "The option is added to the menu");
      el.multiselect("destroy").remove();

      el = $("select").clone().appendTo(body).multiselect();
      var attrs = {title: "Test Title", value: "newOption"}, optgroupID = "Optgroup One";
      el.multiselect("addOption", attrs, "Option New", optgroupID);
      assert.ok(el.find("option[value=newOption]").parent().attr('label') === optgroupID, "The option is added to the source element in " + optgroupID);
      assert.ok(menu().find("input[value=newOption]").closest('.ui-multiselect-optgroup').children('a').text() === optgroupID, "The option is added to the menu in " + optgroupID);
      el.multiselect("destroy").remove();
   });

   QUnit.test("removeOption", function(assert) {
      el = $("select").clone().appendTo(body).multiselect();
      assert.ok(el.find("option[value=1]").length === 1, "The option exists in the source element");
      assert.ok(menu().find("input[value=1]").length === 1, "The option exists in the menu");
      el.multiselect("removeOption", "1");
      assert.ok(el.find("option[value=1]").length === 0, "The option is removed from the source element");
      assert.ok(menu().find("input[value=1]").length === 0, "The option is removed from the menu");
      el.multiselect("destroy").remove();
   });

   QUnit.test("checkAll", function(assert){
      el = $("select").multiselect().multiselect("checkAll");
      var inputs = menu().find("input");
      assert.ok( inputs.filter(":checked").length === inputs.length, 'All inputs selected on the widget');
      el = $("select").multiselect("uncheckAll");
      el = $("select").multiselect("checkAll", 2);
      assert.equal( inputs.filter(":checked").length, 2, 'Inputs in last option group checked in the widget');
      el.multiselect("destroy");
   });

   QUnit.test("uncheckAll", function(assert){
      el = $("select").multiselect().multiselect("checkAll").multiselect("uncheckAll");
      var inputs = menu().find("input");
      assert.ok( inputs.filter(":checked").length === 0, 'All inputs unchecked on the widget');
      el = $("select").multiselect("checkAll");
      el = $("select").multiselect("uncheckAll", 'Optgroup three');
      assert.equal( inputs.not(":checked").length, 2, 'Inputs in last option group not checked in the widget');
      el.multiselect("destroy");
   });

   QUnit.test("flipAll", function(assert){
      el = $("select").multiselect().multiselect("checkAll").multiselect("flipAll");
      var inputs = menu().find("input");
      assert.ok( inputs.filter(":checked").length === 0, 'All inputs unchecked on the widget');
      el = $("select").multiselect("checkAll");
      el = $("select").multiselect('flipAll', 'Optgroup three');
      assert.equal( inputs.not(":checked").length, 2, 'Inputs in last option group not checked in the widget');
      el.multiselect("destroy");
   });

   QUnit.test("collapseAll", function(assert){
      el = $("select").multiselect().multiselect("collapseAll");
      var optgroups = menu().find(".ui-multiselect-optgroup");
      assert.ok( optgroups.filter(".ui-multiselect-collapsed").length === optgroups.length, 'All option groups are collapsed in the widget');
      el = $("select").multiselect("expandAll");
      el = $("select").multiselect("collapseAll", 2);
      assert.equal( optgroups.filter(".ui-multiselect-collapsed").length, 1, 'Last option group collapsed in the widget');
      el.multiselect("destroy");
   });

   QUnit.test("expandAll", function(assert){
      el = $("select").multiselect().multiselect("collapseAll").multiselect("expandAll");
      var optgroups = menu().find(".ui-multiselect-optgroup");
      assert.ok( optgroups.filter(".ui-multiselect-collapsed").length === 0, 'All option groups expanded in the widget');
      el = $("select").multiselect("collapseAll");
      el = $("select").multiselect("expandAll", 'Optgroup three');
      assert.equal( optgroups.filter(".ui-multiselect-collapsed").length, 2, 'Last option group expanded in the widget');
      el.multiselect("destroy");
   });

   QUnit.test("isOpen", function(assert){
      el = $("select").multiselect().multiselect("open");
         assert.ok( el.multiselect("isOpen"), 'Testing isOpen method after calling open method');
      el = $("select").multiselect("close");
         assert.ok( !el.multiselect("isOpen"), 'Testing isOpen method after calling close method');
      el.multiselect("destroy");
   });

   QUnit.test("destroy", function(assert){
      el = $("select").multiselect().multiselect("destroy");
         assert.ok( !$(".ui-multiselect").length , 'button.ui-multiselect removed from the DOM');
         assert.ok( !el.data("multiselect") , 'no more multiselect obj attached to elem');
   });

   QUnit.test("getChecked", function(assert){
      el = $("select").multiselect().multiselect("checkAll");
         assert.equal( el.multiselect("getChecked").length, 9, 'number of checkboxes returned after checking all and calling getChecked');
      el.multiselect("uncheckAll");
         assert.equal( el.multiselect("getChecked").length, 0, 'number of checkboxes returned after unchecking all and calling getChecked');
      el.multiselect("destroy");
   });

   QUnit.test("getUnchecked", function(assert){
      el = $("select").multiselect().multiselect("checkAll");
      assert.equal( el.multiselect("getUnchecked").length, 0, 'number of checkboxes returned after checking all and calling getUnchecked');
      el.multiselect("uncheckAll");
      assert.equal( el.multiselect("getUnchecked").length, 9, 'number of checkboxes returned after unchecking all and calling getUnchecked');
      el.multiselect("destroy");
   });

   QUnit.test("resync & value", function(assert){
      el = $("select").clone().appendTo(body).multiselect().multiselect('uncheckAll');
      el.val(['1','7']);
      el.multiselect('resync');
      assert.equal( el.multiselect("getChecked").length, 2, 'number of checkboxes returned after setting native select value and calling resync');
      el.multiselect('value',['1','2','7']);
      assert.equal( el.multiselect("getChecked").length, 3, 'number of checkboxes returned after using value method');
      el.multiselect("destroy").remove();
   });

   QUnit.test("refresh", function(assert){
      el = $("select").clone().appendTo(body).multiselect();
      el.empty().html('<option value="foo" data-testval=123>foo</option><option value="bar">bar</option>');
      el.multiselect('refresh');

      var checkboxes, getCheckboxes = (function hai(){
         checkboxes = menu().find('input[type="checkbox"]');
         return hai;
      })();

      assert.equal( checkboxes.length, 2, "After clearing the select, adding 2 options, and refresh(), only 2 checkboxes exist");
      assert.equal( checkboxes.eq(0).val(), 'foo', 'first is foo' );
      assert.equal( checkboxes.eq(1).val(), 'bar', 'second is bar' );

      // add one more w/ append, just for safety's sake
      el.append('<option value="baz" data-testval="something">baz</option>');
      el.multiselect('refresh');
      getCheckboxes();
      assert.equal( checkboxes.eq(2).val(), 'baz', 'after an append() call, the third option is now baz' );
      assert.equal($(el.multiselect("instance").$inputs[0]).data().testval, 123, "the first input has the data attribute testval with value 123");
      assert.equal($(el.multiselect("instance").$inputs[2]).data().testval, "something", "the third input has the data attribute testval with value something");

      el.multiselect("destroy").remove();
   });

   QUnit.test("position", function(assert) {
    var left = "500px";

    el = $("select").clone().appendTo(body).multiselect();
    // Position doesn't work reliably on hidden elements
    el.multiselect("open");

    // move the button
    button().css({ position: "absolute", left: left });
    // sanity check the fact that the menu and button are out of sync
    assert.notEqual(menu().css("left"), left, "After moving the button, the menu remains in its old position");
    // update the menu position
    el.multiselect("position");

    // make sure the new position is accurate
    assert.equal(menu().css("left"), left, "After calling position(), the menu has updated to the same left value as the button");

    el.multiselect("destroy").remove();
   });

})(jQuery);
