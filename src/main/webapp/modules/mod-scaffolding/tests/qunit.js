(function() {
  QUnit.module('mod-scaffolding', {
    beforeEach: function() {
      // init module
      var modFixtures = document.querySelectorAll('.mod.mod-scaffolding');
      if (modFixtures.length < 1) {
        var div = document.createElement('div');
        div.innerHTML = window.__html__['modules/mod-scaffolding/fixtures/scaffolding.html'];
        document.body.appendChild(div);

        mm.startModule('scaffolding', false);
      }
    }
  });

  QUnit.test('init', function(assert) {
    var soy = document.querySelectorAll('p.soy');
    assert.ok(soy.length > 0, 'element found');
  });
})();