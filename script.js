const budgetController = (function() {
    const Expense = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    };
  
    const Income = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    };
  
    const data = {
      allItems: {
        exp: [],
        inc: []
      },
      totals: {
        exp: 0,
        inc: 0
      }
    };
  })();
  
  const UIController = (function() {
    const DOMStrings = {
      inputType: ".add__type",
      inputDescription: ".add__description",
      inputValue: ".add__value",
      inputButton: ".add__btn"
    };
  
    return {
      getInput: function() {
        return {
          type: document.querySelector(DOMStrings.inputType).value,
          description: document.querySelector(DOMStrings.inputDescription).value,
          value: document.querySelector(DOMStrings.inputValue).value
        };
      },
      getDOMStrings: function() {
        return DOMStrings;
      }
    };
  })();
  
  const controller = (function(budgetCtrl, UICtrl) {
    const setupEventListeners = function() {
      const DOMStrings = UICtrl.getDOMStrings();
  
      document.querySelector(DOMStrings.inputButton).addEventListener("click", ctrlAddItem);
  
      document.addEventListener("keypress", function(event) {
        if (event.keyCode === 13 || event.which === 13) {
          ctrlAddItem();
        }
      });
    };
  
    const ctrlAddItem = function() {
      // 1. Get the field input data
      const input = UICtrl.getInput();
  
      // 2. Add the item to the budget controller
      // 3. Add the item to the UI
      // 4. Calculate the budget
      // 5. Display the budget on the UI
    };
  
    return {
      init: function() {
        console.log("Application has started.");
        setupEventListeners();
      }
    };
  })(budgetController, UIController);
  
  controller.init();
  