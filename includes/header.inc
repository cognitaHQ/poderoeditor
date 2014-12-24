	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="description" content="">
	<meta name="author" content="">
	<link rel="shortcut icon" href="/ico/favicon.ico">

	<title>PoderoEditor</title>

	<!-- Bootstrap core CSS -->
	<link href="/css/bootstrap.min.css" rel="stylesheet">
	<link href="/css/select2.css" rel="stylesheet"/>
	<link href="/css/datepicker.css" rel="stylesheet" type="text/css">
	<style>
		.division {
			overflow: hidden;
			text-align: center;
			font-size:150%;
			color: #ccc;
			margin: 20px;
		}
		.division:before,
		.division:after {
			background-color: #ccc;
			content: "";
			display: inline-block;
			height: 1px;
			position: relative;
			vertical-align: middle;
			width: 40%;
		}
		.division:before {
			right: 0.5em;
			margin-left: -40%;
		}
		.division:after {
			left: 0.5em;
			margin-right: -40%;
		}
		body {
			padding-top: 40px;
			padding-bottom: 40px;
			background-color: #eee;
		}

		.form-signin {
			max-width: 330px;
			padding: 15px;
			margin: 0 auto;
		}
		.msg{
			max-width: 330px;
			padding: 15px;
			margin: 0 auto;	
		}
		.form-signin .form-signin-heading,
		.form-signin .checkbox {
			margin-bottom: 10px;
		}
		.form-signin .checkbox {
			font-weight: normal;
		}
		.form-signin .form-control {
			position: relative;
			height: auto;
			-webkit-box-sizing: border-box;
			-moz-box-sizing: border-box;
			box-sizing: border-box;
			padding: 10px;
			font-size: 16px;
		}
		.form-signin .form-control:focus {
			z-index: 2;
		}
		.form-signin input[type="email"] {
			margin-bottom: -1px;
			border-bottom-right-radius: 0;
			border-bottom-left-radius: 0;
		}
		.form-signin input[type="password"] {
			margin-bottom: 10px;
			border-top-left-radius: 0;
			border-top-right-radius: 0;
		}
		footer{
			position: fixed;
			bottom: 0px;
			width:100%;
			background: black;
			color:grey;
			text-align: center;
		}
		table { border-collapse: collapse; }
		.percent {
			position: absolute; width: 300px; height: 14px; z-index: 1; text-align: center; font-size: 0.8em; color: white;
		}
		.progress-bar {
			width: 300px; height: 14px;
			border-radius: 10px;
			border: 1px solid #CCC;
			background-image: -webkit-gradient(linear, left top, left bottom, from(#6666cc), to(#4b4b95));
			border-image: initial;
		}
		.uploaded {
			padding: 0;
			height: 14px;
			border-radius: 10px;
			background-image: -webkit-gradient(linear, left top, left bottom, from(#66cc00), to(#4b9500));
			border-image: initial;
		}
		.dropbox {
			width: 15em;
			height: 3em;
			border: 2px solid #DDD;
			border-radius: 8px;
			background-color: #FEFFEC;
			text-align: center;
			color: #BBB;
			font-size: 2em;
			font-family: Arial, sans-serif;
		}
		.dropbox span {
			margin-top: 0.9em;
			display: block;
		}
		.dropbox.not-available {
			background-color: #F88;
		}
		.dropbox.over {
			background-color: #bfb;
		}

	</style>
	<!-- Just for debugging purposes. Don't actually copy this line! -->
	<!--[if lt IE 9]><script src="../../assets/js/ie8-responsive-file-warning.js"></script><![endif]-->

	<!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
      <![endif]-->
	<script type="text/javascript" src="/js/jquery.min.js"></script>
	<script type="text/javascript" src="/js/bootstrap.min.js"></script>
  </head>
