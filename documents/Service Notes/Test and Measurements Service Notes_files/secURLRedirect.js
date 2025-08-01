	/**
	 * This java script file  is responsible for the following thing.
	 * 1. In case of ideal session for a same time as configured in OAM.USer will be redirected 
	 *  to the same url again so that lates USER_EMAIL cookie with null value arrives to app servre for correct processing.
	 * 2. USer will not be redirected from here if he is looged in or guest already.
	 */
	var currentURL = document.URL;
    var cookies     = document.cookie;
    var ssoKey      = cookies.indexOf("USER_CREDENTIALS=VALID");
    var emailKey  = cookies.indexOf("USER_EMAIL=null");	
// currentURL   = currentURL.replace(strRE,"&");	
//alert(ssoKey+"  ===  "+emailKey);	

c_name = "USER_EMAIL";
c_email = "";
if (document.cookie.length>0) {
         c_start=document.cookie.indexOf(c_name + "=");
                if (c_start!=-1) {
                        c_start=c_start + c_name.length+1;
                         c_end=document.cookie.indexOf(";",c_start);
                        if (c_end==-1) {
                         c_end=document.cookie.length;
                        }
  //                      alert(document.cookie.substring(c_start,c_end));
				c_email = document.cookie.substring(c_start,c_end);      
//			alert("c_email "+c_email);          
}
}



   if(ssoKey != -1 && c_email=="null" ) //check to see if user is logged in
    {

 		location.replace(currentURL); 
 	} 
