(function ($) {
  var form, data;

  QUnit.module("core", {
    beforeEach: function () {
      form = $('<form></form>').appendTo(body);
      data = null;
    },
    afterEach: function () {
      form.remove();
    }
  });

  QUnit.test("init", function (assert) {
    el = $("select").multiselect();
    var $header = header();
    assert.ok($header.find('a.ui-multiselect-all').css('display') !== 'none', 'select all is visible');
    assert.ok($header.find('a.ui-multiselect-none').css('display') !== 'none', 'select none is visible');
    assert.ok($header.find('a.ui-multiselect-close').css('display') !== 'none', 'close link is visible');
    assert.ok(menu().is(':hidden'), 'menu is hidden');
    assert.ok(el.is(":hidden"), 'the original select is hidden');
    assert.ok(el.attr('tabIndex') == 2, 'button inherited the correct tab index');
    el.multiselect("destroy");
  });

  QUnit.test("name space separation", function (assert) {
    var el1 = $('<select multiple="multiple"><optgroup label="foo"><option value="foo">foo</option><option value="bar">bar</option></optgroup><optgroup label="bar"><option value="baz">baz</option><option value="bax">bax</option></optgroup></select>')
      .appendTo(form)
      .multiselect();

    var el2 = $('<select multiple="multiple"><optgroup label="foo"><option value="foo">foo</option><option value="bar">bar</option></optgroup><optgroup label="bar"><option value="baz">baz</option><option value="bax">bax</option></optgroup></select>')
      .appendTo(form)
      .multiselect();

    assert.notEqual(el1.multiselect('widget').find('input').eq(0).attr('id'), el2.multiselect('widget').find('input').eq(0).attr('id'), 'name spaces for multiple widgets are different');

    el1.multiselect('destroy');
    el2.multiselect('destroy');
  });

  QUnit.test("form submission", function (assert) {
    el = $('<select id="test" name="test" multiple="multiple"><option value="foo" selected="selected">foo</option><option value="bar">bar</option></select>')
      .appendTo(form)
      .multiselect()
      .multiselect("checkAll");

    data = form.serialize();
    assert.equal(data, 'test=foo&test=bar', 'after checking all and serializing the form, the correct keys were serialized');

    el.multiselect("uncheckAll");
    data = form.serialize();
    assert.equal(data.length, 0, 'after unchecking all and serializing the form, nothing was serialized');

    // re-check all and destroy, exposing original select
    el.multiselect("checkAll").multiselect("destroy");
    data = form.serialize();
    assert.equal(data, 'test=foo&test=bar', 'after checking all, destroying the widget, and serializing the form, the correct keys were serialized');
  });

  QUnit.test("form submission, optgroups", function (assert) {
    el = $('<select id="test" name="test" multiple="multiple"><optgroup label="foo"><option value="foo">foo</option><option value="bar">bar</option></optgroup><optgroup label="bar"><option value="baz">baz</option><option value="bax">bax</option></optgroup></select>')
      .appendTo(form)
      .multiselect()
      .multiselect("checkAll");

    data = form.serialize();
    assert.equal(data, 'test=foo&test=bar&test=baz&test=bax', 'after checking all and serializing the form, the correct keys were serialized');

    el.multiselect("uncheckAll");
    data = form.serialize();
    assert.equal(data.length, 0, 'after unchecking all and serializing the form, nothing was serialized');

    // re-check all and destroy, exposing original select
    el.multiselect("checkAll").multiselect("destroy");
    data = form.serialize();
    assert.equal(data, 'test=foo&test=bar&test=baz&test=bax', 'after checking all, destroying the widget, and serializing the form, the correct keys were serialized');

    // reset option tags
    el.find("option").each(function () {
      this.selected = false;
    });

    // test checking one option in both optgroups
    el.multiselect();

    // finds the first input in each optgroup (assumes 2 options per optgroup)
    el.multiselect("widget").find('.ui-multiselect-checkboxes li:not(.ui-multiselect-optgroup-label) input:even').each(function (i) {
      this.click();
    });

    data = form.serialize();
    assert.equal(data, 'test=foo&test=baz', 'after manually checking one input in each group, the correct two are serialized');

    el.multiselect('destroy');
  });

  QUnit.test("form submission, single select", function (assert) {
    // Use an underlying single-select here.
    el = $('<select id="test" name="test"><option value="foo">foo</option><option value="bar">bar</option><option value="baz">baz</option></select>')
      .appendTo(form)
      .multiselect();

    // select multiple radios to ensure that, in the underlying select, only one
    // will remain selected
    var radios = menu().find(":radio");
    radios[0].click();
    radios[2].click();
    radios[1].click();

    data = form.serialize();
    assert.equal(data, 'test=bar', 'the form serializes correctly after clicking on multiple radio buttons');
    assert.equal(radios.filter(":checked").length, 1, 'Only one radio button is selected');

    // uncheckAll method
    el.multiselect("uncheckAll");
    data = form.serialize();
    assert.equal(data.length, 0, 'After unchecking all, nothing was serialized');
    assert.equal(radios.filter(":checked").length, 0, 'No radio buttons are selected');

    // checkAll method
    el.multiselect("checkAll");
    data = form.serialize();
    assert.equal(el.multiselect("getChecked").length, 1, 'After checkAll, only one radio is selected');
    assert.equal(radios.filter(":checked").length, 1, 'One radio is selected');

    // expose original
    el.multiselect("destroy");
    data = form.serialize();
    assert.equal(data, 'test=baz', 'after destroying the widget and serializing the form, the correct key was serialized: ' + data);
  });

  QUnit.test("form reset, nothing pre-selected", function (assert) {
    var noneSelected = 'Please check something';

    el = $('<select name="test" multiple="multiple"><option value="foo">foo</option><option value="bar">bar</option></select>')
      .appendTo(form)
      .multiselect({ noneSelectedText: noneSelected, selectedList: 0 })
      .multiselect("checkAll");

    // trigger reset
    var done = assert.async();
    form.trigger("reset");

    setTimeout(function () {
      assert.equal(menu().find(":checked").length, 0, "no checked checkboxes");
      assert.equal(button().text(), noneSelected, "none selected text");
      el.multiselect('destroy');
      done();
    }, 10);
  });

  QUnit.test("form reset, pre-selected options", function (assert) {
    el = $('<select name="test" multiple="multiple"><option value="foo" selected="selected">foo</option><option value="bar" selected="selected">bar</option></select>')
      .appendTo(form)
      .multiselect({ selectedText: '# of # selected', selectedList: 0 })
      .multiselect("uncheckAll");

    // trigger reset
    var done = assert.async();
    form.trigger("reset");

    setTimeout(function () {
      assert.equal(menu().find(":checked").length, 2, "two checked checkboxes");
      assert.equal(button().text(), "2 of 2 selected", "selected text");
      el.multiselect('destroy');
      done();
    }, 10);
  });

})(jQuery);
