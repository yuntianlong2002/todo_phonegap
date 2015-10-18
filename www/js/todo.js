angular.module('todoApp', ["firebase"])
  .controller('TodoListController', function TodoListController($scope, $rootScope, $firebaseArray) {

    var url = 'https://recurring2do.firebaseio.com';
    var fireRef = new Firebase(url);

    // For progress bar.
    var widths = ["5%", "25%", "50%", "75%", "100%"];
    var colors = ["#f63a0f", "#f27011", "#f2b01e", "#f2d31b", "#86e01e"];

    fireRef.onAuth(function(authData) {
      if (authData) {
        console.log("User " + authData.uid + " is logged in with " + authData.provider);
        updateRootScope(authData.google.displayName, authData.google.id);
        updateData($rootScope.userid);
      } else {
        console.log("User is logged out");
      }
    });

    if (typeof $rootScope.userid != 'undefined') {
      updateData($rootScope.userid);
    } else {
      assignTempUser();
    }

    $scope.addTodo = function() {
      var newTodo = $scope.newTodo.trim();
      if (!newTodo.length) {
        return;
      }
      $scope.todos.$add({
        title: newTodo,
        completed: false,
        finishtime: 'Mon Jan 01 1900',
        width: '5%',
        color: '#f63a0f',
        color_index: 0,
        visibility: 'show'
      });
      $scope.newTodo = '';
    };

    function updateData(uid) {
      url = 'https://recurring2do.firebaseio.com/' + uid;
      fireRef = new Firebase(url);
      // Bind the todos to the firebase provider.
      $scope.todos = $firebaseArray(fireRef);
      $scope.newTodo = '';
    }

    // Assign the temp user (browser spcific).
    function assignTempUser() {
      //Replace with local user id
      new Fingerprint2().get(function(result) {
        console.log(result);
        $rootScope.tempuser = result;
        updateData($rootScope.tempuser);
      });
    }

    function updateRootScope(display_name, id) {
      $rootScope.display_name = display_name;
      $rootScope.userid = id;
    }

    // Helper function for login.
    function login(service_name) {
      // Check if already logged in.
      if (!$rootScope.display_name) {
          fireRef.authWithOAuthPopup(service_name, function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
          } else {
            if (service_name == "google") {
              updateRootScope(authData.google.displayName, authData.google.id);
            } else if (service_name == "facebook") {
              updateRootScope(authData.facebook.displayName, authData.facebook.id);
            }
            updateData($rootScope.userid);
          }
        }, {
          scope: "email" // the permissions requested
        });
      } else {
        $rootScope.display_name = "";
        //Replace with local user id
        fireRef.unauth();
        updateData($rootScope.tempuser);
      }
    }

    $scope.loginGoogle = function() {
      login("google");
    }

    $scope.loginFacebook = function() {
      login("facebook");
    }

    // When logged in, this function will return the user's full name from
    // Google or Facebook stored in a global scope.
    $scope.iflogin = function() {
      if(!$rootScope.display_name)
        return "";
      return $rootScope.display_name;
    }

    $scope.finish = function(todo) {
      var d = new Date();
      // If a todo is completed, hide the progress bar.
      if (!todo.completed) {
        todo.completed = true;
        todo.visibility= 'hidden';
      } else {
        todo.completed = false;
        todo.visibility= 'show';
      }
      // Log the finish time.
      todo.finishtime = d.toDateString();
      $scope.todos.$save(todo);
    };

    // Increase the progress.
    $scope.advance = function(todo) {
      todo.color_index = (todo.color_index + 1) % 5;
      todo.color = colors[todo.color_index];
      todo.width = widths[todo.color_index];
      $scope.todos.$save(todo);
    };

    $scope.removeTodo = function(todo) {
      $scope.todos.$remove(todo);
    };

    $scope.archive = function() {
      $scope.todos.forEach(function(todo) {
        // Remove completed TODOs
        if (todo.completed) {
          $scope.removeTodo(todo);
        }
      });
    };

  });
