'use strict';
var app = angular.module("app",['ui.router','toaster','ngAnimate','angularSpinner',
	'jcs-autoValidate','ngBootbox','angularUtils.directives.dirPagination','ui.bootstrap',
	'appProveedores','ngCookies']);

app.directive("ccSomething",function(){
	return{
		'transclude':true,
		'restrict':'AE',
		'templateUrl':"templates/spinner.html",
		'scope':{
			'isLoading':'=',
			'message':'@'
		}
	}
});

app.directive("ccSpinner",function(){
	return{
		'transclude':true,
		'restrict':'AE',
		'templateUrl':"templates/spinner.html",
		'scope':{
			'isLoading':'=',
			'message':'@'
		}
	}
});

app.directive("ccBuys",function(){
	return{
		'restrict':'AE',
		'templateUrl':"templates/detailedbuy.html",
		'scope':{
			'buy':'='
		},
		'controller':function($scope,buysService,$ngBootbox,$state,$filter){
			$scope.buysService = buysService;
			$scope.redirectEdit = function()
			{
				$state.go("editBuy",{id:$scope.buy.id});
			}

			$scope.deleteBuy = function(){
				$ngBootbox.confirm('¿Desea eliminar el registro de compra de '+$scope.buy.nb_producto+
					' con fecha '+$filter("date")($scope.buy.fec_compra,"fullDate"))
			    .then(function() {
			    	$scope.buysService.deleteBuy($scope.buy);
			    }, function() {
			        console.log('Confirm dismissed!');
			    });
			}
			
		}
		
	}
});

app.directive("buysTable",function(){
		return{
		'restrict':'AE',
		'templateUrl':"templates/tablebuy.html",
		'scope':{
			'buys':'='
		},
		'controller':function($scope,buysService,$ngBootbox,$state,$filter,toaster){
			$scope.buysService = buysService;
			$scope.currentPage       = 1; // Página actual, para paginación
			$scope.pageSize 	     = 5; // Tamaño de la página, para paginación.
			$scope.redirectEdit = function()
			{
				console.log("holiss");
				if(buysService.selectedBuy!=null)
				{
					$state.go("editBuy",{id:$scope.buysService.selectedBuy.id});	
				}else{toaster.pop('error',"Favor de seleccionar una compra");}
				
			}
			$scope.selectBuy   = function(buy)
			{
				if(buysService.selectedBuy == buy)
				{
					buysService.selectedBuy = null;
				}else{buysService.selectedBuy = buy;}
			}

			$scope.deleteBuy = function(){
				var buy = $scope.buysService.selectedBuy;
				$ngBootbox.confirm('¿Desea eliminar el registro de compra de '+buy.nb_producto+
					' con fecha '+$filter("date")(buy.fec_compra,"fullDate"))
			    .then(function() {
			    	$scope.buysService.deleteBuy(buy);
			    }, function() {
			        console.log('Confirm dismissed!');
			    });
			}
			
		}
		
	}
});

app.service("usersService",function($http,toaster,$rootScope,$state,$ngBootbox){
	var self = {
		"selectedUser": null,
		"isLoading":false,
		"search":null,
		"ordering":"name",
		"users":[],
		"userImg":"css/img/default.png",
		"usersType":[],
		"error":false,
		"search":null,
		"userRegister":null,
		"ScreenLoc":null,
		"formModified":false,
		"GoUsers":function(){
			$state.go("users");
		},	
		"ValidateUser":function(User){
				return $http.get("http://localhost/managementsystem/modules/index.php/searchuserbyname",{params:{name:User}})
			
					
		},
		"DeleteUser":function(user)
		{
			if(user==null)
			{
				toaster.pop('error',"Favor de seleccionar un usuario");	
			}else{
				$ngBootbox.confirm('¿Desea eliminar al usuario: '+user.nb_user+'?')
			    .then(function() {
			        // DEleting the user.
			        self.isLoading = true;
			       var id_user = user.id;
			       $http.get("http://localhost/managementsystem/modules/index.php/deleteUser",{params:{user:id_user}}).then(
					 	function(response){
					 		self.isLoading = false;
					 		var error = response.data.error;
					 		if(error!=1)
					 		{
					 			console.log(response.data);
					 			self.users = response.data.info;
					 		}else{toaster.pop('error',response.data.mensaje);	}
					 	},
					 	function(data){
					 		//self.error     = true;
					 		self.isLoading = false;
					 		toaster.pop('error',data.statusText);	
					 	}
					 )
			    }, function() {
			        console.log('Confirm dismissed!');
			    });
			}
		},
		"SaveUser":function(user){
			if(self.ScreenLoc!="add")
			{
				user.pw_password   = "xxxxxxxx";
				user.passwordAgain = "xxxxxxxx";
			}
			// Validando los datos
			if(user.pw_password == user.passwordAgain)
			{
				// Validando si no existe el nombre de usuario.
				if(!self.isLoading)
				{
					self.isLoading = true;

					//validando que no existe el nombre de usuario
					self.ValidateUser(user.nb_user).then(
					 	function(response){
					 		
					 		var Data = response.data;
					 		if(Data.error != 1){
					 			var amountUser = (self.ScreenLoc=="add")?Object.keys(Data).length:0;
					 			if(amountUser==0)
					 			{
					 				// Verificando si se edita o se guarda
					 				var send_method = (self.ScreenLoc=="add")?"post":"put";
					 				var url_method  = (self.ScreenLoc=="add")?"RegisterUser":"EditUser";
					 				var messageEnd  = (self.ScreenLoc=="add")?"Usuario Registrado!":"Usuario Editado";
					 				var user_id     = (user.id!=undefined)?user.id:0;

					 				//Registrando al usuario.
					 				$http({method: send_method,url:"http://localhost/managementsystem/modules/index.php/"+url_method,
										data: $.param({"nb_fname":user.nb_fname,"nb_lname":user.nb_lname,"de_email":user.de_email,"nb_user":user.nb_user,"password":user.pw_password,"type":user.id_rol,"user_id":user_id}), 
									  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
									})
									 .then(
									 	function(response){
									 		
									 		var Data = response.data;
									 		if(Data.error != 1){
									 			self.isLoading = false;
									 			toaster.pop('success',messageEnd);	
									 			self.userRegister = (self.ScreenLoc=="add")?[]:self.userRegister;
									 			self.formModified = true;

									   		}else{
									   			self.error     = true;
									 			self.isLoading = false;
									   			toaster.pop('error',Data.mensaje);	
									   		}
									   		//self.usersType = data;
									 	},
									 	function(data){
									 		//self.error     = true;
									 		self.isLoading = false;
									 		toaster.pop('error',data.statusText);	
									 	}
									 )
					 			}else{
					 				toaster.pop('error',"Ese nombre de usuario ya existe, favor de usar otro.");	
					 				self.isLoading = false;
					 			}
					   		}else{
					   			self.error     = true;
					 			self.isLoading = false;
					   			toaster.pop('error',Data.mensaje);	
					   		}
					 	},
					 	function(data){
					 		//self.error     = true;
					 		self.isLoading = false;
					 		toaster.pop('error',data.statusText);	
					 	}
					 )
					
				}	
			}else{
				toaster.pop('error',"Favor de escribir passwords iguales.");	
			}
		},
		"GetUsersType":function(){
			if(!self.isLoading)
			{
				self.isLoading = true;
				$http({method: "get",url:"http://localhost/managementsystem/modules/index.php/userstype",data: $.param({}), 
				  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				})
				 .then(
				 	function(response){
				 		
				 		var Data = response.data;
				 		if(Data.error != 1){
				 			self.isLoading = false;
				   			self.usersType = Data.info;
				   			console.log(self.usersType);
				   		}else{
				   			self.error     = true;
				 			self.isLoading = false;
				   			toaster.pop('error',Data.mensaje);	
				   		}
				   		//self.usersType = data;
				 	},
				 	function(data){
				 		self.error     = true;
				 		self.isLoading = false;
				 		toaster.pop('error',data.statusText);	
				 	}
				 )
			}
		},
		"getUsers":function(){
			if(!self.isLoading)
			{
				self.isLoading = true;
				$http({method: "get",url:"http://localhost/managementsystem/modules/index.php/users",data: $.param({}), 
				  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				})
				 .then(
				 	function (response){
				 		self.isLoading = false;
				 		self.users = response.data.users;
				 		console.log(self.users);
				 	},
				 	function(data){
				 		self.error = true;
				 		toaster.pop('error',data.statusText);	
				 	}
				 )

			}
		},
	};	

	return self;
});


app.controller("MainController",function($scope,$http,toaster,usersService,$rootScope){
	toaster.pop('success',"Welcome!");	
});

app.controller("usersController",function($scope,toaster,usersService,$state){
	$scope.UsersService = usersService;
	$scope.UsersService.getUsers();
	$scope.loader = true;
	$scope.currentPage       = 1; // Página actual, para paginación
	$scope.pageSize 	     = 5; // Tamaño de la página, para paginación.

	$scope.SelectUser = function(user)
	{
		if(usersService.selectedUser == user)
		{
			usersService.selectedUser = null;
		}else{usersService.selectedUser = user;}
	}

	$scope.RedirectAdd = function()
	{
		$state.go("RegisterUser");
	}

	$scope.RedirectEdit = function(id)
	{
		if(id==null)
		{
			toaster.pop('error',"Favor de seleccionar un usuario");	
		}else{
			$state.go("editUser",{id_user:id});
		}
	}
});

app.controller("ViewController",function($scope,usersService){
	$scope.userImg = usersService.userImg;
});



app.config(function($stateProvider,$urlRouterProvider){
	$stateProvider
	.state('list',{
		url:'/',
		templateUrl:'templates/main.html',
		controller:'MainController'
	})

	.state('users',{
		url:'/users',
		templateUrl:'templates/users.html',
		controller:'usersController'
	})

	.state('RegisterUser',{
		url:'/RegisterUser',
		templateUrl:'templates/RegisterUser.html',
		controller:'RegisterUserController'
	})

	.state('editUser',{
		url:'/editUser/:id_user',
		templateUrl:'templates/RegisterUser.html',
		controller:'editUserController'	
	})

	.state('proveedores',{
		url:'/proveedores',
		templateUrl:'templates/proveedores.html',
		controller:'proveedoresController'
	})
	.state('addSuplier',{
		url:'/addSuplier',
		templateUrl:'templates/RegisterSuplier.html',
		controller:'RegisterSuplierController'
	})
	.state('editSuplier',{
		url:'/editSuplier/:id',
		templateUrl:'templates/RegisterSuplier.html',
		controller:'editSuplierController'	
	})
	.state('productos',{
		url:'/productos/:id',
		templateUrl:'templates/productos.html',
		controller:'productosController'	
	})
	.state('addproduct',{
		url:'/addproduct/:id',
		templateUrl:'templates/productform.html',
		controller:'addproductController'	
	})
	.state('editProduct',{
		url:'/editProduct/:id',
		templateUrl:'templates/productform.html',
		controller:'editProductController'	
	})
	.state('buys',{
		url:'/buys/',
		templateUrl:'templates/buys.html',
		controller:'productsController'	
	})
	.state('buysDetail',{
		url:'/buysdetail/',
		templateUrl:'templates/buysdetail.html',
		controller:'buysDetailController'	
	})
	.state('buysDetail.buysFrames',{
		url:'/buysFrames/:type',
		templateUrl:'templates/buysframes.html',
		controller:'buysDetailController'
	})
	.state('buysDetail.buysTables',{
		url:'/buysTables/:type',
		templateUrl:'templates/buytables.html',
		controller:'buysDetailController'
	})
	.state('addBuy',{
		url:'/addBuy/',
		templateUrl:'templates/addBuy.html',
		controller:'addBuyController'	
	})
	.state('editBuy',{
		url:'/editBuy/:id',
		templateUrl:'templates/addBuy.html',
		controller:'editBuyController'	
	});

	$urlRouterProvider.otherwise('/');
});

app.controller("RegisterUserController",function($scope,usersService,$http,toaster,$state){
	$scope.usersService 		  = usersService;
	$scope.usersService.GetUsersType();
	$scope.title        		  = "Registro de usuarios";
	$scope.usersService.ScreenLoc = "add";
	$scope.types 				  = $scope.usersService.usersType;

	$scope.$watch("usersService.formModified",function(){
		if(usersService.formModified==true)
		{
			$scope.userForm.$setPristine();
			$scope.usersService.userRegister = [];
			$scope.usersService.formModified = false;
		}
	});
		
});

app.controller("editUserController",function($scope,usersService,$http,toaster,$state,$stateParams){
	$scope.usersService 		  = usersService;
	$scope.usersService.GetUsersType();
	$scope.title        		  = "Edición de usuarios";
	$scope.usersService.ScreenLoc = "edit";
	$scope.id_user      		  = $stateParams.id_user;
	$scope.types				  = $scope.usersService.usersType;
	


	// Buscando por id el usuario
	$scope.usersService.isLoading = true;
	$http.get("http://localhost/managementsystem/modules/index.php/searchUserById",{params:{id_user:$scope.id_user}}).then(
		function (response)
		{
	 		$scope.usersService.isLoading = false;
	 		$scope.usersService.userRegister = response.data.info[0];
	 		$scope.usersService.userRegister.pw_password = "";
	 		console.log($scope.userRegister);
	 	},
	 	function(data){
	 		self.error = true;
	 		toaster.pop('error',data.statusText);	
	 	}
	);

});

app.run(
	function(defaultErrorMessageResolver){
		defaultErrorMessageResolver.getErrorMessages().then(function(errorMessages){
			errorMessages['badPattern'] = "Llene correctamente el campo";
		});
	}
);

