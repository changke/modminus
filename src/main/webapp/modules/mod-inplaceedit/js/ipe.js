goog.provide('mm.modules.ipe');

goog.require('mm.module');

/**
 * In-Place Editing
 *
 * @constructor
 * @extends {mm.module}
 * @param {Object} ctx Root element of the module, wrapped as a G object
 * @param {Number} id Internal id, doesn't really mean anything
 * @param {Object} pubsub PubSub object
 * @param {Object=} params Optional additional parameters
 */
mm.modules.ipe = function(ctx, id, pubsub, params) {
  goog.base(this, ctx, id, pubsub, params);
  this.name = 'ipe';

  this.itemSelector = '[data-item]';
  this.editButtonSelector = '[data-action="edit"]';
  this.doneButtonSelector = '[data-action="done"]';
  this.cancelButtonSelector = '[data-action="cancel"]';
  this.deleteButtonSelector = '[data-action="delete"]';
};
goog.inherits(mm.modules.ipe, mm.module);
goog.exportSymbol('mm.modules.ipe', mm.modules.ipe);

mm.modules.ipe.prototype.run = function() {
  this.retrieveItems();
};

mm.modules.ipe.prototype.retrieveItems = function() {
  var self = this;

  this.getJSON('/assets/inplaceedit/example.json', {}, function(res) {
    self.listItems(res.items);
  });
};

mm.modules.ipe.prototype.listItems = function(itemsData) {
  // show items
  var itemsHtml = mm.templates.inplaceedit.list({items: itemsData}).content;
  this.ctx.empty().append(G(itemsHtml));

  // set edit/delete button events
  var items = this.ctx.find(this.itemSelector);
  if (items.length > 0 && items.length === itemsData.length) {
    // event for delete
    var deleteBtns = items.find(this.deleteButtonSelector);
    this.applyEvent(deleteBtns, 'delete');

    var editBtns = items.find(this.editButtonSelector);
    this.applyEvent(editBtns, 'edit');
  }
};

mm.modules.ipe.prototype.applyEvent = function(btns, eventName) {
  var self = this;

  switch (eventName) {
    case 'delete':
      btns.on('click', function(e) {
        e.preventDefault();
        var btn = e.currentTarget;
        var itemId = btn.getAttribute('rel');
        self.deleteItem(itemId);
      });
      break;
    case 'edit':
      btns.on('click', function(e) {
        e.preventDefault();
        var btn = e.currentTarget;
        var itemRow = btn.parentNode.parentNode;
        var item = {
          id: btn.getAttribute('rel'),
          title: itemRow.querySelector('.ipe__items h4').innerHTML,
          description: itemRow.querySelector('.ipe__items p').innerHTML
        };
        self.applyEditingMask(itemRow, item);
      });
      break;
    case 'done':
      btns.on('click', function(e) {
        e.preventDefault();
        var btn = e.currentTarget;
        var itemRow = btn.parentNode.parentNode;
        var newItem = {
          id: btn.getAttribute('rel'),
          title: itemRow.querySelector('[name="txtCateTitle"]').value,
          description: itemRow.querySelector('[name="txtCateDesc"]').value
        };

        self.updateItem(newItem);
      });
      break;
  }

};

mm.modules.ipe.prototype.deleteItem = function(itemId) {
  if (window.confirm('Are you sure?')) {
    this.log('To delete item ' + itemId + '.');
  }
};

mm.modules.ipe.prototype.updateItem = function(newItem) {
  // do update
  this.log(JSON.stringify(newItem));

  // fresh retrieve
  this.retrieveItems();
};

mm.modules.ipe.prototype.applyEditingMask = function(row, item) {
  var self = this;

  var rowHtml = mm.templates.inplaceedit.editingMask({item: item}).content;
  var oldHtml = row.innerHTML;

  // show edit mask
  row.innerHTML = rowHtml;

  var gRow = G(row);
  var doneBtn = gRow.find(this.doneButtonSelector);
  this.applyEvent(doneBtn, 'done');

  var cancelBtn = gRow.find(this.cancelButtonSelector);
  cancelBtn.on('click', function(e) {
    e.preventDefault();
    // restore old dom and re-apply event
    row.innerHTML = oldHtml;
    self.applyEvent(gRow.find(self.editButtonSelector), 'edit');
    self.applyEvent(gRow.find(self.deleteButtonSelector), 'delete');
    self.log('Editing cancelled.');
  });
};
