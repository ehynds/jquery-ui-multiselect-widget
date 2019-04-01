(function($){
  var el, widget, button, input;

  function getVisible() {
    return widget.find(".ui-multiselect-checkboxes input:visible");
  }

  function getChecked() {
    return el.multiselect("getChecked");
  }

  function getSelected() {
    return el.children(":selected");
  }

  function searchFor(term) {
    input.val(term).trigger("search");
  }

  function triggerClick() {
    this.click();
  }

  function searchTest( term, expected, message ) {
    message || (message = "searching for '#'");
    message = message.replace("#", term);
    searchFor(term);
    QUnit.assert.equal( getVisible().length, expected, message );
  }

  QUnit.module("filter widget - multiple select", {
    beforeEach: function() {
      el = $('<select multiple>' +
        '<option></option>' +
        '<option value="foo">testffoooo</option>' +
        '<option value="bar">testbbaarr</option>' +
        '<option value=" baz ">testbbaazz</option>' +
        '<option value="qux">testquxtest</option>' +
        '<option value="10">ten</option>' +
        '<option value="100">one hundred</option>' +
        '<option value="5">five</option>' +
        '<option>a test with word boundaries</option>' +
        '<option>special regex !^$()//-|{}/: characters</option>' +
        '</select>');

      el.appendTo(document.body);
      el.multiselect();
      el.multiselectfilter();
      el.multiselect("open");

      widget = el.multiselect("widget");
      input = widget.find(".ui-multiselect-filter input");
      button = el.next();
    },

    afterEach: function() {
      el.multiselectfilter("destroy");
      el.multiselect("destroy");
      el.remove();
    }
  });

  QUnit.test("defaults", function(assert){
    assert.ok( input.is(":visible"), "Filter input box is visible" );
  });

  QUnit.test("filtering by node text", function(assert){
    searchTest( "bbaa", 2);
    searchTest( "bbaarr", 1);
    searchTest( "  bbaa  ", 2, "searching for '#' with whitespace");
    searchTest( " ", el.children().length, "searching for an empty string");
    searchTest( "test", 5);
    searchTest( "one hundred", 1);
    searchTest( "with wor", 1);
    searchTest( " with wor  ", 1);

    $.each("$ ^ / : // { } | -".split(" "), function( i, char ){
      searchTest( char, 1 );
    });
  });

  QUnit.test("filtering & checking", function(assert){
    searchFor("ba");

    getVisible().each(triggerClick);
    assert.equal(getChecked().length, 2, "Two checkboxes are selected");
    assert.equal(getSelected().length, 2, "Two option tags are selected");

    getVisible().each(triggerClick);
    assert.equal(getChecked().length, 0, "After clicking again, no checkboxes are selected");
    assert.equal(getSelected().length, 0, "After clicking again, no tags are selected");
  });

  QUnit.test("checkAll / uncheckAll", function(assert){
    searchFor("ba");

    el.multiselect("checkAll");
    assert.equal(getChecked().length, 2, "checkAll: two checkboxes are selected");
    assert.equal(getSelected().length, 2, "checkAll: two option tags are selected");

    el.multiselect("uncheckAll");
    assert.equal(getChecked().length, 0, "uncheckAll: no checkboxes are selected");
    assert.equal(getSelected().length, 0, "uncheckAll: no option tags are selected");
  });

  QUnit.test("combination of filtering/methods/click events", function(assert){
    searchFor("ba");

    getVisible().first().each(triggerClick);
    assert.equal(getChecked().length, 1, "selecting 1 of multiple results (checked)");
    assert.equal(getSelected().length, 1, "selecting 1 of multiple results (selected)");

    searchFor(" ");
    assert.equal(getChecked().length, 1, "clearing search, only 1 is still selected");
    el.multiselect("uncheckAll");
    assert.equal(getChecked().length, 0, "uncheckAll, nothing is selected (checked)");
    assert.equal(getSelected().length, 0, "uncheckedAll, nothing is selected (selected)");

    searchFor("one hundred")
    el.multiselect("checkAll");
    assert.equal(getChecked().length, 1, "checkAll on one matching result (checked)");
    assert.equal(getSelected().length, 1, "checkAll on one matching result (selected)");

    searchFor("foo");
    el.multiselect("checkAll");
    assert.equal(getChecked().length, 2, "checkAll on one matching result (checked)");
    assert.equal(getSelected().length, 2, "checkAll on one matching result (selected)");
  });
})(jQuery);
