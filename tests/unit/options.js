(function ($) {

    QUnit.module("options");

    QUnit.test("noneSelectedText", function (assert) {
      var text;

      el = $("select").multiselect({
          noneSelectedText: 'None Selected'
      });

      // read from widget
      text = el.multiselect("option", "noneSelectedText");

      assert.equal(button().text(), text, 'on init, button reads "None Selected"');
      el.multiselect("checkAll");
      assert.ok(button().text() !== text, 'after checkAll, button no longer reads "None Selected"');
      el.multiselect("uncheckAll");
      assert.equal(button().text(), text, 'after uncheckAll, button text restored to "None Selected"');

      // change the option value
      el.multiselect("option", "noneSelectedText", "No Checkboxes Checked");
      assert.equal(el.multiselect("option", "noneSelectedText"), "No Checkboxes Checked", "new noneSelectedText value set correctly");

      // read updated value from widget
      text = el.multiselect("option", "noneSelectedText");

      // test against the new value
      assert.equal(button().text(), text, 'after changing the option value, button now reads "No Checkboxes Checked"');
      el.multiselect("checkAll");
      assert.ok(button().text() !== text, 'after checkAll, button no longer reads "No Checkboxes Checked"');
      el.multiselect("uncheckAll");
      assert.equal(button().text(), text, 'after uncheckAll, button text restored to "No Checkboxes Checked"');

      el.multiselect("destroy");
    });

    QUnit.test("selectedText", function (assert) {
      var numOptions = $("select option").length;

      el = $("select").multiselect({
          selectedText: '# of # selected',
          selectedList: 0
      });

      el.multiselect("checkAll");
      assert.equal(button().text(), numOptions + ' of ' + numOptions + ' selected', 'after checkAll, button reflects the total number of checked boxes');

      // change option value
      el.multiselect("option", "selectedText", function (numChecked) {
          return numChecked + ' options selected';
      });

      assert.equal(button().text(), numOptions + ' options selected', 'after changing the option to a function value, button reflects the new text');

      // uncheck all
      el.multiselect("uncheckAll");
      assert.equal(button().text(), el.multiselect("option", "noneSelectedText"), 'after unchecking all, button text now reflects noneSelectedText option value');

      el.multiselect("destroy");
    });

    QUnit.test("selectedList", function (assert) {
      var html = '<select multiple><option value="foo">foo &quot;with quotes&quot;</option><option value="bar">bar</option><option value="baz">baz</option></select>';

      el = $(html).appendTo("body").multiselect({
          selectedList: 3,
          selectedListSeparator: ', '
      });

      el.multiselect("checkAll");
      assert.equal(button().text(), 'foo "with quotes", bar, baz', '(plain text list separator & button text) after checkAll, button text is a list of all options in the select');
      el.multiselect("destroy").remove();

      el = $(html).appendTo("body").multiselect({
          selectedList: 3,
          selectedListSeparator: ',<br>',
          htmlText: ['button']
      });

      el.multiselect("checkAll");
      assert.equal(button().children('span').not('.ui-multiselect-open').html(),'foo "with quotes",<br>bar,<br>baz',
                        '(html list separator & html button text) after checkAll, button html is a list of all options in the select on separate lines');
      el.multiselect("destroy").remove();

      el = $(html).appendTo("body").multiselect({
          selectedList: 2,
          selectedListSeparator: ', '
      });

      el.multiselect("checkAll");
      assert.equal(button().text(), '3 of 3 selected', 'after checkAll with a limited selectedList value, button value displays number of checked');
      el.multiselect("destroy").remove();
    });

    QUnit.test("maxSelected", function (assert) {
      var html = '<select multiple><option value="foo">foo &quot;with quotes&quot;</option><option value="bar">bar</option><option value="baz">baz</option></select>';

      el = $(html).appendTo("body").multiselect({
          maxSelected: 2
      });

      var checkboxes = el.multiselect("widget").find(":checkbox");
      checkboxes.eq(0).trigger('click');
      checkboxes.eq(1).trigger('click');
      checkboxes.eq(2).trigger('click');

      assert.equal(menu().find("input").filter(":checked").length, 2, 'after clicking each checkbox, count of checked restored to maxSelected of 2');

      el.multiselect('uncheckAll');
      assert.equal(menu().find("input").filter(":checked").length, 0, 'after uncheckAll() count of checked is 0');

      el.multiselect('flipAll');
      assert.equal(menu().find("input").filter(":checked").length, 0, 'none checked - after flipAll() count of checked is 0');

      checkboxes.eq(0).trigger('click');
      checkboxes.eq(1).trigger('click');
      el.multiselect('flipAll');
      assert.equal(menu().find("input").filter(":checked").length, 1, '2 checked - after flipAll() count of checked is 1');

      el.multiselect('checkAll');
      assert.equal(menu().find("input").filter(":checked").length, 1 , 'after checkAll() count of checked is still 1');

      el.multiselect('uncheckAll');
      el.multiselect('checkAll');
      assert.equal(menu().find("input").filter(":checked").length, 0 , 'after uncheckAll() + checkAll() count of checked is 0');

      el.multiselect("destroy").remove();
    });

    function asyncSelectedList(useTrigger, message, assert) {
      var html = '<select multiple><option value="foo">foo</option><option value="bar">bar</option><option value="baz">baz</option></select>',
          checkboxes;

      el = $(html).appendTo(body).multiselect({
          selectedList: 2,
          selectedListSeparator: ', '
      });

      checkboxes = el.multiselect("widget").find(":checkbox");
      var done = assert.async();

      if (useTrigger) {
          checkboxes.eq(0).trigger('click');
          checkboxes.eq(1).trigger('click');
      } else {
          checkboxes.eq(0)[0].click();
          checkboxes.eq(1)[0].click();
      }

      setTimeout(function () {
          assert.equal(button().text(), 'foo, bar', message);
          el.multiselect("destroy").remove();
          done();
      }, 10);
    }

    QUnit.test("selectedList - manual trigger - jQuery", function (assert) {
      asyncSelectedList(true, 'manually checking items with trigger()', assert);
    });

    QUnit.test("selectedList - manual trigger - native", function (assert) {
      asyncSelectedList(false, 'manually checking items with element.click()', assert);
    });

    QUnit.test("selectedList - encoding", function (assert) {
      el = $('<select><option value="A&amp;E">A&amp;E</option></select>')
          .appendTo("body")
          .multiselect({ selectedList: 1 });

      assert.equal(button().text(), 'A&E');
      el.multiselect("destroy").remove();
    });

    QUnit.test("menuHeight", function (assert) {
      var height = 100;

      el = $("select").multiselect({ menuHeight: height }).multiselect("open");
      assert.equal(height, menu().outerHeight(), 'height after opening property set to ' + height);

      // change height and re-test
      height = 300;
      el.multiselect("option", "menuHeight", height);
      assert.equal(height, menu().outerHeight(), 'changing value through api to ' + height);

      el.multiselect("destroy");
    });

    QUnit.test("buttonWidth", function (assert) {
      var buttonWidth = 321;

      el = $("select").multiselect({ buttonWidth: '>=' + buttonWidth }).multiselect("open");
      assert.equal(button().outerWidth(), buttonWidth, 'outerWidth of button is ' + buttonWidth);

      // change width and re-test
      buttonWidth = 351;
      el.multiselect("option", "buttonWidth", '>=' + buttonWidth);
      assert.equal(button().outerWidth(), buttonWidth, 'changing value through api to ' + buttonWidth);

      // change width to something that should fail.
      buttonWidth = 10;
      el.multiselect("option", "buttonWidth", '>=' + buttonWidth);
      var outerWidth = button().outerWidth();
      assert.ok(buttonWidth !== outerWidth, 'changing value through api to ' + buttonWidth + ' (too small), outerWidth is actually ' + outerWidth);

      // Reference: https://www.wired.com/2010/12/why-percentage-based-designs-dont-work-in-every-browser/
      buttonWidth = "50%";
      el.multiselect("option", "buttonWidth", '>=' + buttonWidth);
      var outerWidthX2 = Math.floor(button().outerWidth() * 2);  // Double to reduce chance of fractions
      var parentWidth = Math.floor(el.parent().outerWidth());
      assert.ok(Math.abs(outerWidthX2 - parentWidth) <= 1, 'changing value to 50%');  // Off by 1 is assert.ok due to floating point rounding discrepancies between browsers.

      buttonWidth = "351px";
      el.multiselect("option", "buttonWidth", '>=' + buttonWidth);
      assert.equal(button().outerWidth(), 351, 'buttonWidth supports strings suffixed with px as well as integer px values');

      buttonWidth = "22em";
      el.multiselect("option", "buttonWidth", '>=' + buttonWidth);
      assert.equal(button().outerWidth(), 22 * 16, 'buttonWidth supports strings suffixed with "em" unit as well as integer px values');

      el.multiselect("destroy");
    });

    QUnit.test("menuWidth", function (assert) {
      var width = 50;

      el = $("select").multiselect({ buttonWidth: 100, menuWidth: width }).multiselect("open");

      assert.equal(menu().parent().find(".ui-multiselect-menu").outerWidth(), width, 'width after opening, property set to ' + width);

      // change width and re-test
      width = 300;
      el.multiselect("option", "menuWidth", width).multiselect('refresh');
      assert.equal(menu().parent().find(".ui-multiselect-menu").outerWidth(), width, 'changing value through api to ' + width);

      width = "3in";
      el.multiselect("option", "menuWidth", width).multiselect('refresh');
      assert.equal(menu().parent().find(".ui-multiselect-menu").outerWidth(), 3 * 96.0, 'menuWidth supports strings suffixed with "in" unit as well as integer "px" values');

      el.multiselect("destroy");
    });

    QUnit.test("checkAllText", function (assert) {
      var text = "foo";

      el = $("select").multiselect({ header: ['checkAll','uncheckAll','flipAll'],  linkInfo: {checkAll: {text: text}} });
      assert.equal(menu().find(".ui-multiselect-all").text(), text, 'check all link reads ' + text);

      // set through option
      text = "bar";
      el.multiselect("option", "checkAllText", "bar");
      assert.equal(menu().find(".ui-multiselect-all").text(), text, 'check all link reads ' + text);

      el.multiselect("destroy");
    });

    QUnit.test("uncheckAllText", function (assert) {
      var text = "foo";

      el = $("select").multiselect({ header: ['checkAll','uncheckAll','flipAll'],  linkInfo: {uncheckAll: {text: text}} });
      assert.equal(menu().find(".ui-multiselect-none").text(), text, 'check all link reads ' + text);

      // set through option
      text = "bar";
      el.multiselect("option", "uncheckAllText", "bar");
      assert.equal(menu().find(".ui-multiselect-none").text(), text, 'changing value through api to ' + text);

      el.multiselect("destroy");
    });

    QUnit.test("flipAllText", function (assert) {
      var text = "foo";

      el = $("select").multiselect({ header: ['checkAll','uncheckAll','flipAll'], linkInfo: {flipAll: {text: text}} });
      assert.equal(menu().find(".ui-multiselect-flip").text(), text, 'flip all link reads ' + text);

      // set through option
      text = "bar";
      el.multiselect("option", "flipAllText", "bar");
      assert.equal(menu().find(".ui-multiselect-flip").text(), text, 'changing value through api to ' + text);

      el.multiselect("destroy");
    });

    QUnit.test("collapseAllText", function (assert) {
      var text = "foo";

      el = $("select").multiselect({ header: ['collapseAll','expandAll'], linkInfo: {collapseAll: {text: text}} });
      assert.equal(menu().find(".ui-multiselect-collapseall").text(), text, 'collapse all link reads ' + text);

      // set through option
      text = "bar";
      el.multiselect("option", "collapseAllText", "bar");
      assert.equal(menu().find(".ui-multiselect-collapseall").text(), text, 'changing value through api to ' + text);

      el.multiselect("destroy");
    });

    QUnit.test("expandAllText", function (assert) {
      var text = "foo";

      el = $("select").multiselect({ header: ['collapseAll','expandAll'], linkInfo: {expandAll: {text: text}} });
      assert.equal(menu().find(".ui-multiselect-expandall").text(), text, 'expand all link reads ' + text);

      // set through option
      text = "bar";
      el.multiselect("option", "expandAllText", "bar");
      assert.equal(menu().find(".ui-multiselect-expandall").text(), text, 'changing value through api to ' + text);

      el.multiselect("destroy");
    });

    QUnit.test("autoOpen", function (assert) {
      el = $("select").multiselect({ autoOpen: false });
      assert.ok(menu().is(":hidden"), 'menu is hidden with autoOpen off');
      el.multiselect("destroy");

      el = $("select").multiselect({ autoOpen: true });
      assert.ok(menu().is(":visible"), 'menu is visible with autoOpen on');
      el.multiselect("destroy");

      el = $("select").multiselect({ autoOpen: false, listbox: true });
      assert.ok(menu().is(":visible"), 'menu is visible with autoOpen off and list box option enabled');
      el.multiselect("destroy");
    });

    QUnit.test("multiple (false - single select)", function (assert) {
      $("select").removeAttr("multiple");
      el = $("select").multiselect({ multiple: false, header: ['checkAll', 'uncheckAll', 'flipAll'] });

      // get some references
      var $menu = menu(), $header = header();

      assert.ok($header.find('a.ui-multiselect-all').is(':hidden'), 'select all link is hidden');
      assert.ok($header.find('a.ui-multiselect-flip').is(':hidden'), 'flip all link is hidden');
      assert.ok($header.find('a.ui-multiselect-none').is(':hidden'), 'select none link is hidden');
      assert.ok($header.find('a.ui-multiselect-close').css('display') !== 'none', 'close link is visible');
      assert.ok(!$menu.find(":checkbox").length, 'no checkboxes are present');
      assert.ok($menu.find(":radio").length > 0, 'but radio boxes are');

      // simulate click on ALL radios
      var radios = $menu.find(":radio").trigger("click");

      // at the end of that, only one radio should be checked and the menu closed
      assert.equal(radios.filter(":checked").length, 1, 'After checking all radios, only one is actually checked');
      assert.equal(false, el.multiselect('isOpen'), 'Menu is closed');

      // uncheck boxes... should only be one
      radios.filter(":checked").trigger("click");

      // method calls
      el.multiselect("checkAll");
      assert.equal($menu.find("input:radio:checked").length, 1, 'After checkAll method call only one is actually checked');

      el.multiselect("uncheckAll");
      assert.equal($menu.find("input:radio:checked").length, 0, 'After uncheckAll method nothing is checked');

      // check/uncheck all links
      assert.equal($menu.find(".ui-multiselect-all, ui-multiselect-none").filter(":visible").length, 0, "Check/uncheck all links don't exist");

      el.multiselect("destroy");
      $("select").attr("multiple", "multiple");
    });

    QUnit.test("multiple (changing dynamically)", function (assert) {
      el = $('<select multiple><option value="foo">foo</option></select>')
          .appendTo("body")
          .multiselect();

      el.multiselect("option", "multiple", false);
      assert.equal(el[0].multiple, false, "When changing a multiple select to a single select, the select element no longer has the multiple property");
      assert.equal(menu().hasClass("ui-multiselect-single"), true, "...and the menu now has the single select class");
      assert.equal(menu().find('input[type="radio"]').length, 1, "...and the checkbox is now a radio button");

      el.multiselect("option", "multiple", true);
      assert.equal(el[0].multiple, true, "When changing a single select to a multiple select, the select element has the multiple property");
      assert.equal(menu().hasClass("ui-multiselect-single"), false, "...and the menu doesn't have the single select class");
      assert.equal(menu().find('input[type="checkbox"]').length, 1, "...and the radio button is now a checkbox");

      el.multiselect("destroy").remove();
    });

    QUnit.test("classes", function (assert) {
      var classname = 'foo';

      el = $("select").multiselect({ classes: classname });
      var $button = button(), $widget = menu();

      assert.equal($widget.hasClass(classname), true, 'menu has the class ' + classname);
      assert.equal($button.hasClass(classname), true, 'button has the class ' + classname);

      // change it up
      var newclass = 'bar';
      el.multiselect("option", "classes", newclass);
      assert.equal($widget.hasClass(newclass), true, 'menu has the new class ' + newclass);
      assert.equal($button.hasClass(newclass), true, 'button has the new class ' + newclass);
      assert.equal($button.hasClass(classname), false, 'menu no longer has the class ' + classname);
      assert.equal($button.hasClass(classname), false, 'button no longer has the class ' + classname);
      el.multiselect("destroy");
    });

    QUnit.test("header", function (assert) {
      function countLinks() {
          return header().find("a").length;
      }

      // default
      el = $("select").multiselect({ autoOpen: true });
      assert.ok(header().is(':visible'), "default config: header is visible");
      el.multiselect("option", "header", false);
      assert.ok(header().is(':hidden'), "after changing header option on default config: header is no longer visible");

      // test for all links within the default header
      assert.equal(countLinks(), 3, "number of links in the default header config");

      el.multiselect("destroy");

      // create again, this time header false
      el = $("select").multiselect({ header: false, autoOpen: true });
      assert.ok(header().is(':hidden'), "init with header false: header is not visible");
      el.multiselect("option", "header", true);
      assert.ok(header().is(':visible'), "after changing header option: header is visible");

      el.multiselect("destroy");

      // create again, this time custom header
      el = $("select").multiselect({ header: "hai guyz", autoOpen: true });
      assert.equal(header().text(), "hai guyz", "header assert.equal custom text");
      assert.equal(countLinks(), 1, "number of links in the custom header config (should be close button)");

      el.multiselect("destroy");
    });

    QUnit.test("selectedListSeparator", function (assert) {
      el = $("select").multiselect({ selectedListSeparator: "<br/>", selectedList: 15 });
      el.multiselect("checkAll");
      var text = $(button()).text();
      var matched = [];
      assert.equal(text.indexOf(","), -1, "There are no commas in the button text");
      matched = text.match(/\<br\/\>/g);
      assert.equal(matched.length, 8, "The 9 selected values are joined by <br> tags");
      el.multiselect("option", "selectedListSeparator", ", ");
      text = $(button()).text();
      matched = text.match(/\,/g);
      assert.equal(matched.length, 8, "The 9 selected values are joined by commas again after calling the option method");
      el.multiselect("destroy");
    });
})(jQuery);
