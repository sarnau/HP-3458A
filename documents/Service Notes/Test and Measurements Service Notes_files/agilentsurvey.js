function agilentSurvey(loc)
{
var businessCode = "";
var locale = loc;
var emgfreq = 0;    //do not edit this line (ever!)  
var emgfreq = 1000;    //remove leading slash characters to turn survey on, Add two leading forward slash characters to turn survey off
//Note: frequency value above represents a percentage of users invited to take the survey (for example: 15000 equals 15%)

 
//var lscafreq = 0;//as LSCA no more part of the CIA


   if (selectuser())
    {
      if (findCookie())
       {
           if(notdirectedtoACSsurvey())
             {
               survey();
             }
       }
    }
//1.function to check if user allows client side js
//2.selecting the user for the survey
function selectuser()
{
var nth = getNTH(); 
var Denominator = 100000;
var rnd = Math.floor(Math.random() * Denominator) + 1;
if (rnd < nth) 
 {
 return true;
    }
}
//Checking the BU and setting the frequencies
 function getNTH() 
{
   
 if (document.all)  
 {
  MetaTagList = document.all.tags("meta"); 
 }else if (document.documentElement) 
 {
   MetaTagList = document.getElementsByTagName("meta"); 
  }else{
   MetaTagList=null;
  }
 
 if(MetaTagList != null){
   for (i = 0; i < MetaTagList.length; i++) 
   {
   	if ( MetaTagList[i].name )
    {
      if ( MetaTagList[i].name == 'DC.Publisher')
     {
		 businessCode = MetaTagList[i].content;
       
     }//end of if (MetaTagList[i].name == 'DC.Publisher')
    }// end of if ( MetaTagList[i].name )
  } // end of for
	if((locale == null)||(locale==""))
	{
		for (i = 0; i < MetaTagList.length; i++) 
		{	
			if (MetaTagList[i].getAttributeNode) 
			{
				if(MetaTagList[i].getAttributeNode('http-equiv').value == 'Content-Language')
				{			
					MetaName = 'Content-Language';
					locale = MetaTagList[i].content;
				}
			}
		}
	}
 } // end of if(MetaTagList != null)

 //checking the business units
 
 if((businessCode !=null)||(businessCode =="")){
 if(businessCode.indexOf("epsg")>-1)
 {
  if((locale=="ja-JP")&&(emgfreq <= 25000)) emgfreq = emgfreq * 1.7; //Modify survey frequency for Japan only. (normal is 1.7)
  if((locale=="en-US")&&(emgfreq <= 25000)) emgfreq = emgfreq * 0.8; //Modify survey frequency for U.S. only. (0.8)
  if((locale=="zh-CN")&&(emgfreq <= 25000)) emgfreq = emgfreq * 0.6; //Modify survey frequency for China only.(0.6)
  if((locale=="ko-KR")&&(emgfreq <= 25000)) emgfreq = emgfreq * 1.0; //Modify survey frequency for Korea only.(1.0)
  if((locale=="zh-TW")&&(emgfreq <= 25000)) emgfreq = emgfreq * 1.0; //Modify survey frequency for Taiwan only.(1.0)
  return emgfreq;
 }else if (businessCode.indexOf("atg")>-1) 
 {
	 businessCode = "epsg";
     return emgfreq;
 }else if (businessCode.indexOf("atg-emt")>-1)
 {
	 businessCode = "epsg";
     return emgfreq;
 }else if (businessCode.indexOf("atg-ste")>-1)
 {
	 businessCode = "epsg";
     return  emgfreq;
 }else if (businessCode.indexOf("csg-cms")>-1)
 {
	 businessCode = "epsg";
     return emgfreq;
 }else if (businessCode.indexOf("csg-css")>-1)
 {
	 businessCode = "epsg";
     return emgfreq;
 }else if (businessCode.indexOf("csg-wns")>-1)
 {
	 businessCode = "epsg";
     return emgfreq;
 }
 /*
//for lsca BU return lscafreq only 
 else if (businessCode.indexOf("lsca")>-1)
 {
  return lscafreq;
 }*/
 else
 {
  return 1;
 }
 }
}
//3.The user is accepting Agilent cookies  AND

	
function setCookie (name, value, expires) 
{
	if (expires) 
	{
		document.cookie = name + "=" + escape (value) + "; expires=" + expires.toGMTString() +  "; path=";  
	} else { 
		document.cookie = name + "=" + escape (value) + "; path=";  
	}
}


function getCookie (name) 
{

	var dcookie = document.cookie;
	var cname = name + "=";
	var clen = dcookie.length;        
	var cbegin = 0;                   
	while (cbegin < clen) 
	{           
		var vbegin = cbegin + cname.length;                    
		if (dcookie.substring(cbegin, vbegin) == cname) 
		{      
			 var vend = dcookie.indexOf (";", vbegin);           
			 if (vend == -1) vend = clen;                        
				return unescape(dcookie.substring(vbegin, vend));   
		}                                                      
		cbegin = dcookie.indexOf(" ", cbegin) + 1;             
		if (cbegin == 0) break;                                
	 }                                                         
	 return null;                                              
} 

function findCookie()
{
      
	 var expdate = new Date ();     
				
	 expdate.setTime (expdate.getTime() + (1000 * 60 * 1 * 1 * 1)); 

	 setCookie ("cookie_test", "true", expdate); 
	  
	 var persistentCookieEnabled=(getCookie("cookie_test") == "true")? true : false; 

	 if (persistentCookieEnabled) 
	 { 
		return true;
	 }else{
		return false;
	 }
}
//4.The user has not been directed to the invitation page previously - i.e. the user does not have a ACSSurvey cookie. 
function notdirectedtoACSsurvey()
{
        var cookieName = "ACSsurvey";
        var allcookies = document.cookie;
  if (allcookies.indexOf(cookieName) < 0) //Cookie not found
  return true;
}
//if all the criterias match
//1.function to set the cookie
function setACSCookie(){
// variable expiration date cookie - only modify daysToExpiration
 /*var daysToExpiration = 90; // Set days till expiration
 var exp = new Date(); // Creates date variable exp
 var currentTime = exp.getTime(); //returns current time in msecs
 var expireTime = currentTime + (daysToExpiration*24*60*60*1000); // adds variable expiration time to current time
 exp.setTime(expireTime); 
  // creates expiration date exp for cookie
// Set the domain to the same as the page the script is on
 document.cookie = "ACSsurvey=1;expires="+exp+";path=/;domain=.agilent.com";*/
var cookieDate = new Date();
cookieDate.setTime(cookieDate.getTime() + 1000 * 60 * 60 * 24 * 90);
var name = "ACSsurvey";
var value = "1";
document.cookie = name+"="+escape(value)+";expires=" + cookieDate.toGMTString()+";path=/; domain=.agilent.com";
 
}
//2.Redirect the user to the invitation url
 
function decode(str) {
     var result = "";
 
     for (var i = 0; i < str.length; i++) {
          if (str.charAt(i) == "+") result += " ";
          else result += str.charAt(i);
 
          return unescape(result);
     }
}
 
function survey()
{
    var currentPage = location.href;
	var call="";
 	call=newTargetURL();
	var gomez = "";
	gomez = navigator.userAgent; // This is to bypass Gomez.
 
 function newTargetURL()
 {
 var newTargetURL = "";
 return encodeURIComponent (currentPage);
 }

	 setACSCookie(); // Sets cookie indicating the person has been selected
		 // Gets full URL for currrent web page making survey request
		//var optinURL = "http://acomd1.cos.agilent.com:6666/cgi-bin/paramlinktest.pl"; // Sets location of Opt-In request
if(gomez.indexOf('GomezAgent') == -1){
		var optinURL = "https://survey7.maritz.com/83a67804/pu002/agilent_emg.php";
		var additionalInformation = "LOCALE="+locale+"&BU="+businessCode+"&REF_URL="+call;
	 if(optinURL.indexOf('?') > -1)
		   optinURL = optinURL+"&"+additionalInformation;
	 else
		optinURL = optinURL+"?"+additionalInformation;
	//2.Redirect the user to the invitation url
	//window.open(optinURL); 
	location.href=optinURL;
 }
}
}
