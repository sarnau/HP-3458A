//SECURITYDOC Function : logOff
//SECURITYDOC purpose  : To log off from Screens.

 function displayHelp(filename,language)
 {
 	var file="resources/help/"+filename+"_"+language+".htm";
	var x= window.open(file, 'abcd', 'toolbar=0,scrollbars=yes,location=0,statusbar=1,menubar=0,resizable=yes,width=620,height=300,border=0,left =260,top =200');
	if (window.focus) {x.focus()}
	return false;
 }	
	function logoff(){
		parent.location.href='/litapp/logout.jsp';
	}	
    function openRegistration(){
		parent.location.href='/litapp/CMNSecurity.do?method=openRegistration';
	}
    function forgotPassword(){
		parent.location.href='/litapp/ForgotPassword.jsp';
	}
	var code1 = 11;
	var code2 = 12;
	function splitStr(s){
		sArr = new Array();
		sArr = s.split('');
		var newPass='';
		for(i=0;i<sArr.length;i++){
			ascii_value (sArr[i]);
			newPass = newPass + ascii_value (sArr[i]);
			
		}
		return newPass;
	}
	function ascii_value (c)
	{
		// restrict input to a single character
		c = c . charAt (0);
	
		// loop through all possible ASCII values
		var i;
		for (i = 0; i < 256; ++ i)
		{
			// convert i into a 2-digit hex string
			var h = i . toString (16);
			if (h . length == 1)
				h = "0" + h;
	
			// insert a % character into the string
			h = "%" + h;
	
			// determine the character represented by the escape code
			h = unescape (h);
	
			// if the characters match, we've found the ASCII value
			if (h == c)
				break;
		}
		return i-code1-code2+100;
	}