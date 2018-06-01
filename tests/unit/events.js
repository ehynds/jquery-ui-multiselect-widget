(function($){

   QUnit.module("events");

   QUnit.test("multiselectopen", function(assert){
      // inject widget
      el = $("<select multiple><option value='foo'>foo</option></select>").appendTo(body);
      el.multiselect({
         open: function(e,ui){
            assert.ok( true, 'option: multiselect("open") fires open callback' );
            assert.equal(this, el[0], "option: context of callback");
            assert.equal(e.type, 'multiselectopen', 'option: event type in callback');
            assert.equal(menu().css("display"), 'block', 'menu display css property assert.equal block');
            assert.propEqual(ui, {}, 'option: ui hash in callback');
         }
      })
      .on("multiselectopen", function(e,ui){
         assert.ok(true, 'event: multiselect("open") fires multiselectopen event');
         assert.equal(this, el[0], 'event: context of event');
         assert.propEqual(ui, {}, 'event: ui hash');
      });

      // now try to open it..
      el.multiselect("open");
		
      // make sure the width of the menu and button are equivalent
      assert.equal( button().outerWidth(), menu().outerWidth(), 'button and menu widths are equivalent');

      // close
      el.multiselect("close");

      // make sure a click event on the button opens the menu as well.
      button().trigger("click");
      el.multiselect("close");

      // make sure a click event on a span inside the button opens the menu as well.
      button().find("span:first").trigger("click");

      // reset for next test
      el.multiselect("destroy").remove();

      // now try returning false prevent opening
      el = $("<select></select>")
         .appendTo(body)
         .multiselect()
         .on("multiselectbeforeopen", function(){
            assert.ok( true, "event: binding multiselectbeforeopen to return false (prevent from opening)" );
            return false;
         })
         .multiselect("open");

      assert.ok( !el.multiselect("isOpen"), "multiselect is not open after multiselect('open')" );
      el.multiselect("destroy").remove();
   });

   QUnit.test("multiselectclose", function(assert){
      // inject widget
      el = $("<select multiple><option>foo</option></select>").appendTo(body);
      el.multiselect({
         close: function(e,ui){
            assert.ok( true, 'option: multiselect("close") fires close callback' );
            assert.equal(this, el[0], "option: context of callback");
            assert.equal(e.type, 'multiselectclose', 'option: event type in callback');
            assert.equal(menu().css("display"), 'none', 'menu display css property assert.equal none');
            assert.propEqual(ui, {}, 'option: ui hash');
         }
      })
      .on("multiselectclose", function(e,ui){
         assert.ok(true, 'multiselect("close") fires multiselectclose event');
         assert.equal(this, el[0], 'event: context of event');
         assert.propEqual(ui, {}, 'event: ui hash');
      })
      .multiselect("open")
      .multiselect("close")
      .multiselect("open");

      // make sure a click event on the button closes the menu as well.
      button().click();
      el.multiselect("open");

      // make sure a click event on a span inside the button closes the menu as well.
      button().find("span:first").click();

      // make sure that the menu is actually closed.  see issue #68
      assert.ok( el.multiselect('isOpen') === false, 'menu is indeed closed' );

      el.multiselect("destroy").remove();
   });

   QUnit.test("multiselectbeforeclose", function(assert){
      // inject widget
      el = $("<select multiple></select>").appendTo(body);
      el.multiselect({
         beforeclose: function(e,ui){
            assert.ok( true, 'option: multiselect("beforeclose") fires close callback' );
            assert.equal(this, el[0], "option: context of callback");
            assert.equal(e.type, 'multiselectbeforeclose', 'option: event type in callback');
            assert.propEqual(ui, {}, 'option: ui hash');
         }
      })
      .on("multiselectbeforeclose", function(e,ui){
         assert.ok(true, 'multiselect("beforeclose") fires multiselectclose event');
         assert.equal(this, el[0], 'event: context of event');
         assert.propEqual(ui, {}, 'event: ui hash');
      })
      .multiselect("open")
      .multiselect("close");

      el.multiselect("destroy").remove();

      // test 'return false' functionality
      el = $("<select multiple></select>").appendTo(body);
      el.multiselect({
         beforeclose: function(){
            return false;
         }
      });

      el.multiselect('open').multiselect('close');
      assert.ok( menu().is(':visible') && el.multiselect("isOpen"), "returning false inside callback prevents menu from closing" );
      el.multiselect("destroy").remove();
   });

   QUnit.test("multiselectclick with multiple widgets", function(assert) {
      var first = $("<select multiple><option value='1'>Option 1</option><option value='2'>Option 2</option></select>").appendTo(body).multiselect();
      var second = $("<select multiple><option value='1'>Option 1</option><option value='2'>Option 2</option></select>").appendTo(body).multiselect();
      assert.equal($('.ui-multiselect').length, 2, "two mutliselects are on the page");
      first.multiselect("refresh");
      second.multiselect("refresh");
      var $label = $(second.multiselect("getLabels")[0]);
      var $wrongInput = $(first.multiselect("getLabels")[0]).find("input");
      $label.click();
      assert.equal($label.find("input").prop("checked"), true, "the input for that label should be checked");
      assert.equal($wrongInput.prop("checked"), false, "the input for the corresponding label on the first widget should not be checked");
      first.multiselect("destroy").remove();
      second.multiselect("destroy").remove();
   });

   QUnit.test("multiselectclick", function(assert){
      var times = 0;

      // inject widget
      el = $("<select multiple><option value='1'>Option 1</option><option value='2'>Option 2</option></select>")
         .appendTo(body);

      el.multiselect({
         click: function(e,ui){
            assert.ok(true, 'option: triggering the click event on the second checkbox fires the click callback' );
            assert.equal(this, el[0], "option: context of callback");
            assert.equal(e.type, 'multiselectclick', 'option: event type in callback');
            assert.equal(ui.value, "2", "option: ui.value assert.equal");
            assert.equal(ui.text, "Option 2", "option: ui.text assert.equal");

            if(times === 0) {
          assert.equal(ui.checked, true, "option: ui.checked assert.equal");
            } else if(times === 1) {
          assert.equal(ui.checked, false, "option: ui.checked assert.equal");
            }
         }
      })
      .on("multiselectclick", function(e,ui){
         assert.ok(true, 'event: triggering the click event on the second checkbox triggers multiselectclick');
         assert.equal(this, el[0], 'event: context of event');
         assert.equal(ui.value, "2", "event: ui.value assert.equal");
         assert.equal(ui.text, "Option 2", "event: ui.text assert.equal");

      if(times === 0) {
        assert.equal(ui.checked, true, "option: ui.checked assert.equal");
      } else if(times === 1) {
        assert.equal(ui.checked, false, "option: ui.checked assert.equal");
      }
      })
      .on("change", function(e){
         if(++times === 1){
            assert.equal(el.val().join(), "2", "event: select element val() within the change event is correct" );
         } else {
            assert.equal(el.val(), null, "event: select element val() within the change event is correct" );
         }

         assert.ok(true, "event: the select's change event fires");
      })
      .multiselect("open");

      // trigger a click event on the input
      var lastInput = menu().find("input").last();
      lastInput[0].click();

      // trigger once more.
      lastInput[0].click();

      // make sure it has focus
      assert.equal(true, lastInput[0] == document.activeElement, "The input has focus");

      // make sure menu isn't closed automatically
      assert.equal( true, el.multiselect('isOpen'), 'menu stays open' );

      el.multiselect("destroy").remove();
   });

   QUnit.test("multiselectcheckall", function(assert){
      // inject widget
      el = $('<select multiple><option value="1">Option 1</option><option value="2">Option 2</option></select>').appendTo(body);

      el.multiselect({
         checkAll: function(e,ui){
            assert.ok( true, 'option: multiselect("checkAll") fires checkall callback' );
            assert.equal(this, el[0], "option: context of callback");
            assert.equal(e.type, 'multiselectcheckall', 'option: event type in callback');
            assert.propEqual(ui, {}, 'option: ui hash in callback');
         }
      })
      .on("multiselectcheckall", function(e,ui){
         assert.ok( true, 'event: multiselect("checkall") fires multiselectcheckall event' );
         assert.equal(this, el[0], 'event: context of event');
         assert.propEqual(ui, {}, 'event: ui hash');
      })
      .on("change", function(){
         assert.ok(true, "event: the select's change event fires");
         assert.equal( el.val().join(), "1,2", "event: select element val() within the change event is correct" );
      })
      .multiselect("open")
      .multiselect("checkAll");

      assert.equal(menu().find("input").first()[0] == document.activeElement, true, "The first input has focus");

      el.multiselect("destroy").remove();
   });

   QUnit.test("multiselectuncheckall", function(assert){
      // inject widget
      el = $('<select multiple><option value="1">Option 1</option><option value="2">Option 2</option></select>').appendTo(body);

      el.multiselect({
         uncheckAll: function(e,ui){
            assert.ok( true, 'option: multiselect("uncheckAll") fires uncheckall callback' );
            assert.equal(this, el[0], "option: context of callback");
            assert.equal(e.type, 'multiselectuncheckall', 'option: event type in callback');
            assert.propEqual(ui, {}, 'option: ui hash in callback');
         }
      })
      .on("multiselectuncheckall", function(e,ui){
         assert.ok( true, 'event: multiselect("uncheckall") fires multiselectuncheckall event' );
         assert.equal(this, el[0], 'event: context of event');
         assert.propEqual(ui, {}, 'event: ui hash');
      })
      .on("change", function(){
         assert.ok(true, "event: the select's change event fires");
         assert.equal( el.val(), null, "event: select element val() within the change event is correct" );
      })
      .multiselect("open")
      .multiselect("uncheckAll");

      assert.equal(menu().find("input").first()[0] == document.activeElement, true, "The first input has focus");

      el.multiselect("destroy").remove();
   });


   QUnit.test("multiselectbeforeoptgrouptoggle", function(assert){
      // inject widget
      el = $('<select multiple><optgroup label="Set One"><option value="1">Option 1</option><option value="2">Option 2</option></optgroup></select>')
          .appendTo(body);

      el.on("change", function(){
         assert.ok(true, "the select's change event fires");
      })
      .multiselect({
			groupsSelectable: true,
         beforeoptgrouptoggle: function(e,ui){
            assert.equal(this, el[0], "option: context of callback");
            assert.equal(e.type, 'multiselectbeforeoptgrouptoggle', 'option: event type in callback');
            assert.equal(ui.label, "Set One", 'option: ui.label assert.equal');
            assert.equal(ui.inputs.length, 2, 'option: number of inputs in the ui.inputs key');
         }
      })
      .on("multiselectbeforeoptgrouptoggle", function(e,ui){
         assert.ok( true, 'option: multiselect("uncheckall") fires multiselectuncheckall event' );
         assert.equal(this, el[0], 'event: context of event');
         assert.equal(ui.label, "Set One", 'event: ui.label assert.equal');
         assert.equal(ui.inputs.length, 2, 'event: number of inputs in the ui.inputs key');
      })
      .multiselect("open");

      menu().find(".ui-multiselect-optgroup a").click();

      el.multiselect("destroy").remove();
      el = el.clone();

      // test return false preventing checkboxes from activating
      el.on("change", function(){
         assert.ok( true ); // should not fire
      }).multiselect({
         beforeoptgrouptoggle: function(){
            return false;
         },
         // if this fires the expected count will be off.  just a redundant way of checking that return false worked
            optgrouptoggle: function(){
                assert.ok( true );
            }
      }).appendTo( body );

        var label = menu().find("li.ui-multiselect-optgroup-label a").click();
        assert.equal( menu().find(":input:checked").length, 0, "when returning false inside the optgrouptoggle handler, no checkboxes are checked" );
        el.multiselect("destroy").remove();
   });

   QUnit.test("multiselectoptgrouptoggle", function(assert){
      // inject widget
      el = $('<select multiple><optgroup label="Set One"><option value="1">Option 1</option><option value="2">Option 2</option></optgroup></select>').appendTo(body);

      el.multiselect({
			groupsSelectable: true,
         optgrouptoggle: function(e,ui){
            assert.equal(this, el[0], "option: context of callback");
            assert.equal(e.type, 'multiselectoptgrouptoggle', 'option: event type in callback');
            assert.equal(ui.label, "Set One", 'option: ui.label assert.equal');
            assert.equal(ui.inputs.length, 2, 'option: number of inputs in the ui.inputs key');
            assert.equal(ui.checked, true, 'option: ui.checked assert.equal true');
         }
      })
      .on("multiselectoptgrouptoggle", function(e,ui){
         assert.ok( true, 'option: multiselect("uncheckall") fires multiselectuncheckall event' );
         assert.equal(this, el[0], 'event: context of event');
         assert.equal(ui.label, "Set One", 'event: ui.label assert.equal');
         assert.equal(ui.inputs.length, 2, 'event: number of inputs in the ui.inputs key');
         assert.equal(ui.checked, true, 'event: ui.checked assert.equal true');
      })
      .multiselect("open");

      // trigger native click event on optgroup
      menu().find(".ui-multiselect-optgroup a").click();
      assert.equal(menu().find(":input:checked").length, 2, "both checkboxes are actually checked" );

      assert.equal(menu().find("input").first()[0] == document.activeElement, true, "The first input has focus");

      el.multiselect("destroy").remove();
   });

})(jQuery);
