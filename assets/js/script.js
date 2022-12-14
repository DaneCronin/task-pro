var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  //check due date
  auditTask(taskLi);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};


// Variable to edit tasks due date colors 
var auditTask = function(taskEl) {
  //Get date from task element
  var date = $(taskEl).find("span").text().trim();
  //to ensure element is getting to the function
  console.log(date);

  //convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);

  //remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days")) <= 2){
    $(taskEl).addClass("list-group-item-warning");
  }
};


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-save").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});


// Click event listener to handle delegated clicks
$(".list-group").on("click", "p", function () {
  var text = $(this)
  .text()
  .trim();
 


var textInput = $("<textarea>").addClass("form-control").val(text);
  $(this).replaceWith(textInput);

  //auto-focus on new element
  textInput.trigger("focus");

});

//editable field was un-focused
  
  $(".list-group").on("blur", "textarea", function() {
    // get the textarea's current value/text
    var text =$(this)
    .val()
    .trim();

    //get the parent ul's id attribute
    var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

    //get the task's position in the list of other li elements
    var index = $(this)
      .closest(".list-group-item")
      .index();

      tasks[status][index].text = text;
      saveTasks();

      //recreate p element
      var taskP = $("<p>")
      .addClass("m-1")
      .text(text);

      //replace textarea with p element
      $(this).replaceWith(taskP);

  });

  // due date was clicked
  $(".list-group").on("click", "span", function() {
    
    //Get Current Text
    var date =$(this)
    .text()
    .trim();

    //Create new input element
    var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-contol")
    .val(date);

    // swap out elements
    $(this).replaceWith(dateInput);

    // enable jquery ui datepicker
    dateInput.datepicker({
      minDate: 1,
      onClose: function() {
        //when calendar is closed, force a "change" event on the dateInput
        $(this).trigger("change");
      }
    });

    //automatically focus on new element
    dateInput.trigger("focus");

  });

  //value of due date was changed
  $(".list-group").on("change", "input[type='text']", function() {

    //Get current text
    var date = $(this)
    .val()
    .trim();

    //Get teh parent ul's id attribute
    var status = $(this)
      .closest(".list-group")
      .attr("id")
      .replace("list-", "");

    // Get the task's position in the list of other li elements
    var index = $(this)
      .closest(".list-group-item")
      .index();


    //update task in array and re-save to localstorage

    tasks[status][index].date = date;
    saveTasks();

    //Re-create span element with bootstrap classes

    var taskSpan =$("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);


    //replace input with span element
    $(this).replaceWith(taskSpan);
    
    //Pass task's <li> element into auditTask() to check new due date
    auditTask($(taskSpan).closest(".list-group-item"));
  });



// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});




// Use SORTABLE from JQuery UI to make lists 'sortable' with drag and drop.
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event, ui) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function(event, ui) {
    $(this).removeClass("dropover");
    console.log("deactivate", this);
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function(event) {
    $(event.target).addClass("dropover-active");
  },
  out: function(event) {
    $(event.target).removeClass("dropover-active");
    console.log("out", event.target);
  },
  update: function(event) {

    //array to store task data in
var tempArr = [];

    //loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
      .find("p")
      .text()
      .trim();

      var date =$(this)
      .find("span")
      .text()
      .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date,
      })
    });

    console.log(tempArr);

       // trim down list's ID to match object property
   var arrName = $(this)
   .attr("id")
   .replace("list-", "");
 
 
   //update array on tasks object and save
   tasks[arrName] = tempArr;
   saveTasks();
  }
   
 
});

// trash icon can be dropped onto
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    // remove dragged element from the dom
    ui.draggable.remove();
    $(".bottom-trash").removeClass("bottom-trash-active");
  },
  over: function(event, ui) {
    console.log(ui);
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function(event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-active");
  }
});

//convert text field into jquery date picker

$("#modalDueDate").datepicker({
  minDate: 1
});


// load tasks for the first time
loadTasks();



// Set an interval to automatically reload page data to check if duedates have changed
setInterval(function() {
  $(".card .list-group-item").each(function(index,el) {
    auditTask(el);
  })
}, (1000 * 60) *30);

console.log(taskEl);