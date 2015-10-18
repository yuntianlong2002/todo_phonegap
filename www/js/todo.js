angular.module('todoApp', ["firebase"])
  .controller('TodoListController', function TodoListController($scope, $rootScope, $firebaseArray) {

    var url = 'https://recurring2do.firebaseio.com';
    var fireRef = new Firebase(url);

    if (typeof $rootScope.userid != 'undefined') {
      url = 'https://recurring2do.firebaseio.com/' + $rootScope.userid;
    } else {
      new Fingerprint2().get(function(result){
        console.log(result);
        $rootScope.tempuser = result;
        url = 'https://recurring2do.firebaseio.com/' + $rootScope.tempuser;
        fireRef = new Firebase(url);
        $scope.todos = $firebaseArray(fireRef);
        $scope.newTodo = '';
      });
    }
    console.log(url);
    var widths = ["5%", "25%", "50%", "75%", "100%"];
    var colors = ["#f63a0f", "#f27011", "#f2b01e", "#f2d31b", "#86e01e"];
    fireRef = new Firebase(url);
    // Bind the todos to the firebase provider.
    $scope.todos = $firebaseArray(fireRef);
    $scope.newTodo = '';

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
      console.log($rootScope.display_name, "new todo added"); //Debug
    };

    $scope.login = function() {
      if(!$rootScope.display_name) {
        fireRef.authWithOAuthPopup("facebook", function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
          } else {
            console.log(authData.facebook.id);
            console.log(authData.facebook.displayName);
            $rootScope.display_name = authData.facebook.displayName;
            $rootScope.userid = authData.facebook.id;
            url = 'https://recurring2do.firebaseio.com/' + $rootScope.userid;
            console.log(url);
            $rootScope.userid = "";
            fireRef = new Firebase(url);
            // Bind the todos to the firebase provider.
            $scope.todos = $firebaseArray(fireRef);
            $scope.newTodo = '';
          }
        }, {
          scope: "email" // the permissions requested
        });
      } else {
        $rootScope.display_name = "";
        //Replace with local user id
        new Fingerprint2().get(function(result){
          console.log(result);
          $rootScope.tempuser = result;
        });
        url = 'https://recurring2do.firebaseio.com/' + $rootScope.tempuser;
        //Replace with local user id
        fireRef.unauth();
        fireRef = new Firebase(url);
        $scope.todos = $firebaseArray(fireRef);
        $scope.newTodo = '';
      }
    }

    $scope.loginGoogle = function() {
      if(!$rootScope.display_name) {
        fireRef.authWithOAuthPopup("google", function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
          } else {
            console.log(authData.google.id);
            console.log(authData.google.displayName);
            $rootScope.display_name = authData.google.displayName;
            $rootScope.userid = authData.google.id;
            url = 'https://recurring2do.firebaseio.com/' + $rootScope.userid;
            console.log(url);
            $rootScope.userid = "";
            fireRef = new Firebase(url);
            // Bind the todos to the firebase provider.
            $scope.todos = $firebaseArray(fireRef);
            $scope.newTodo = '';
          }
        }, {
          scope: "email" // the permissions requested
        });
      } else {
        $rootScope.display_name = "";
        //Replace with local user id
        new Fingerprint2().get(function(result){
          console.log(result);
          $rootScope.tempuser = result;
        });
        url = 'https://recurring2do.firebaseio.com/' + $rootScope.tempuser;
        //Replace with local user id
        fireRef.unauth();
        fireRef = new Firebase(url);
        $scope.todos = $firebaseArray(fireRef);
        $scope.newTodo = '';
      }
    }

    $scope.iflogin = function() {
      if(!$rootScope.display_name)
        return "";
      return $rootScope.display_name;
    }

    $scope.remaining = function() {
      var count = 0;
      var d = new Date();
      $scope.todos.forEach(function(todo) {
        count += todo.completed ? 0 : 1;
        if (todo.finishtime != d.toDateString()) {
          todo.completed = false;
        }
      });
      return count;
    };

    $scope.finish = function(todo) {
      var d = new Date();
      if (!todo.completed) {
        todo.completed = true;
        todo.visibility= 'hidden';
      } else {
        todo.completed = false;
        todo.visibility= 'show';
      }
      todo.finishtime = d.toDateString();
      $scope.todos.$save(todo);
    };

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
        if (todo.completed) {
          $scope.removeTodo(todo);
        }
      });
    };

  });
