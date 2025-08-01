
/**************************************************************
* File Name: jsvalidation.js
* Purpose: This file contains the generic JavaScript validation method 

***************************************************************/

var error = new Array();    // Error Array, contains all error list's
var fldname = new Array();  // Field Name Array contains field Name of Forms, which contains Error.
var e=0;		    // Error Array Element Variable.	

  // Error Description Text 



/***************************************************************
* Function Name: focusFirstField
* Purpose: This function Take the cursor position to the first element of the form field when page loads to browser.
* Parameters: -----
* Return:  -----
******************************************************************/

function focusFirstField()
{
	if (!document.forms[0].elements[0].disabled)
	{
		document.forms[0].elements[0].focus();
	}
}



/***************************************************************
* Function Name: addErrorMsg
* Purpose: This function adds error message to error message array and will return false.
* Parameters: arg_message - error message to be added to error message array, arg_fldname - field name to added to the field name array.
* Return:  false
******************************************************************/

function  addErrorMsg(arg_message, arg_fldname)
{
  error[e] = arg_message;
  fldname[e] = arg_fldname;
  e++;
  return false;
}

function  addErrorMsg1(arg_message, arg_fldname)
{
  error[e] = arg_message;
  fldname[e] = arg_fldname;
  e++;
  return false;
}

/***************************************************************
* Function Name: intializeErrorMsgs
* Purpose: This function flushes previous error messages from array and reinitialized the error message array.
* Parameters: ----
* Return:  -----
******************************************************************/

function initializeErrorMsgs()
{
  error = new Array();
  fldname = new Array();
  e=0;
}



/***************************************************************
* Function Name: displayErrorMsgs
* Purpose: This function displays error messages in Alert window.
* Parameters: -----
* Return:  -----
******************************************************************/

function  displayErrorMsgs()
{
  var errDes="";  // Error Description Text 

  for(n=0;n<=error.length-1;n++)
  {
//   errDes=errDes+error[n]+"\n";
  }
// alert(errDes);   

  showErrors(error);
  initializeErrorMsgs();
  if(fldname[0])
  {
	if(fldname[0].type)
	{
		if((fldname[0].type!="checkbox") && (fldname[0].type!="text") && (fldname[0].type!="textarea") && (fldname[0].type!="select-one") && (fldname[0].type!="password"))
		{
			if(fldname[0][0].type=="radio")
				fldname[0][0].focus();
		}
		else
			fldname[0].focus();
	}
  }	
}



/***************************************************************
* Function Name: checkDisplayErrors
* Purpose: This function checks for error message array, if there are any error messages present in error message array displayErrorMsgs( ) function is called.
* Parameters: ----
* Return:  If found error returns false, else true.
******************************************************************/

function checkDisplayErrors()
{
  if(e>0)
  {
  	displayErrorMsgs();
 	return false;
  }
  else
  {
	return true;
  }
}



/***************************************************************
* Function Name: isEmpty
* Purpose: This function checks whether the textbox, textarea is empty.
* Parameters: arg_fieldName - field name.
* Return:  true / false
******************************************************************/

function isEmpty(arg_fieldName)
{
  if (arg_fieldName.value == '')
  {
   return true;
  }
  else
  {
   return false;
  }  
}



/****************************************************************
* Function Name: rmSpaceBegin
* Purpose: This function Removes single space from begining of the empty string value
* Parameters: arg_fieldname - field name.
* Return: true / false
*****************************************************************/
function rmSpaceBegin(arg_fieldname)
{
  chkString = escape(arg_fieldname.value)
  if( (chkString.substring(0,3)=="%20") && (arg_fieldname.value.length == 1))
  {	
        arg_fieldname.value="";
	return true;
  }
  else
  {
   return false;
  }
}



/***************************************************************
* Function Name: validateEmail
* Purpose: This function Validates email value entered in the form field.
* Parameters: arg_fieldName - email field name, arg_message - email field name with message.
* Return:  If invalid add error in error message array / nothing
******************************************************************/

function validateEmail(arg_fieldName, arg_message)
{
 var email = arg_fieldName.value;
 var flag = new Boolean();

 for(k=0;k<=email.length-1;k++)
 {
  if(email.charAt(k)=="@")
  {
   for(h=k+1;h<=email.length-1;h++)
   {
    if(email.charAt(h)=="@")
 	return addErrorMsg(arg_message, arg_fieldName);
   }
  }
 }

 for(s=0;s<=email.length-1;s++)
 {
  if((email.charAt(s)=="." && email.charAt(s+1)==".") || (email.charAt(s)=="." && email.charAt(s+1)=="@") || (email.charAt(s)=="@" && email.charAt(s+1)==".") || (email.charAt(s)=="@" && email.charAt(s+1)=="@"))
  return addErrorMsg(arg_message, arg_fieldName);
 }

 for(v=0;v<=email.length-1;v++)
 {
  if(escape(email.charAt(v))=="%20")
  return addErrorMsg(arg_message, arg_fieldName);
 }

 if(email.charAt(0)!="@")
 { 
  for(i=0;i<=email.length-1;i++)
  {
   if(email.charAt(i)=="@")
   {
    for(j=i;j<=email.length-1;j++)
    {
     if(email.charAt(j)==".")
	 {
	  if(email.length-1>j+1)
	  {
	   validateSpecialChar(arg_fieldName, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.0123456789_-@", arg_message);
	   return true;
	  }
	 } 
    }
    return addErrorMsg(arg_message, arg_fieldName);
   }
  }
  return addErrorMsg(arg_message, arg_fieldName);
 }
 else
 return addErrorMsg(arg_message, arg_fieldName);
}

/***************************************************************
* Function Name: isNumber
* Purpose: This function checks for Number in the given field.
* Parameters: arg_fieldName - field name, arg_message - user defined message.
* Return:  If invalid adds error message to the error message array and will return false / If valid integer returns true.
******************************************************************/

function isNumber(arg_fieldName, arg_message) {
		if(arg_fieldName >= 48 && arg_fieldName <= 57)
		{
		return addErrorMsg(arg_message, arg_fieldName);  // 0 - 9
		}
	return true;
	}

/***************************************************************
* Function Name: isInteger
* Purpose: This function checks for Integer value in the given field.
* Parameters: arg_fieldName - field name, arg_message - user defined message.
* Return:  If invalid adds error message to the error message array and will return false / If valid integer returns true.
******************************************************************/

function isInteger(arg_fieldName, arg_message)
{
  var fldlen = arg_fieldName.value.length;
  for(i=0;i<=fldlen-1;i++)
  {
   if(arg_fieldName.value.charAt(i)==".")
   return addErrorMsg(arg_message, arg_fieldName); 
  }
  return true;
}



/***************************************************************
* Function Name: isPositiveInteger
* Purpose: This function checks for positive value in the given form field.
* Parameters: arg_fieldName - form field name, arg_message - user defined message.
* Return:  If negative adds error message to error message array and will returns false / If value is positive return true.
******************************************************************/


function isPositiveInteger(arg_fieldName, arg_message)
{
  if(parseFloat(arg_fieldName.value)<parseFloat("0")) 
  return addErrorMsg(arg_message, arg_fieldName);
  else
  return true;
}

function isPositiveIntegerCheck(arg_fieldValue,arg_fieldName, arg_message)
{
  if(parseFloat(arg_fieldValue)<parseFloat("0")) 
  return addErrorMsg(arg_message, arg_fieldName);
  else
  return true;
}


/***************************************************************
* Function Name: isPositiveNaturalNumber
* Purpose: This function checks for positive non-zero value in the given form field.
* Parameters: arg_fieldName - form field name, arg_message - user defined message.
* Return:  If negative adds error message to error message array and will returns false / If value is positive return true.
******************************************************************/


function isPositiveNaturalNumber	(arg_fieldName, arg_message)
{
  if(parseFloat(arg_fieldName.value)<=parseFloat("0")) 
  return addErrorMsg(arg_message, arg_fieldName);
  else
  return true;
}


/***************************************************************
* Function Name: isString
* Purpose: This function checks for validity of String Value.
* Parameters: arg_fieldName - form field name, arg_message - user defined message.
* Return:  If not a valid string adds user defined error message to the error message array and will return false / If valid string returns true.
******************************************************************/

function isString(arg_fieldName, arg_message)
{
  var str = arg_fieldName.value;
  for(i=0;i<=str.length-1;i++)
  {
   if(str.charAt(i) == " ")
   continue;  
   if(!(isNaN(str.charAt(i))))
   return addErrorMsg(arg_message, arg_fieldName);
  }
  return true;
}


/***************************************************************
* Function Name: isNumericValue
* Purpose: This function checks for validity of Numeric Value Entry.
* Parameters: arg_fieldName - form field name, arg_message - user defined message.
* Return:  If not a number adds user defined error message to error message array and will return false / If valid number returns true.
******************************************************************/

function isNumericValue(arg_fieldName, arg_message)
{
  var str = arg_fieldName.value;
  
  if(str.indexOf("e") == -1 && str.indexOf("E") == -1)
  {
	if(isNaN(str))
	{
		
		return addErrorMsg(arg_message, arg_fieldName);
	}
  }
  else
  {
   return addErrorMsg(arg_message, arg_fieldName);
  } 
  return true;
}


/***************************************************************
* Function Name: compareText
* Purpose: This function compares two form field values.
* Parameters: arg_fieldName1 - first form field name, arg_fieldName2 - second form field name.
* Return:  true / false
******************************************************************/

function compareText(arg_fieldName1, arg_fieldName2)
{
  if(arg_fieldName1.value!=arg_fieldName2.value)
  return true;
  else
  return false;
}



/***************************************************************
* Function Name: validateMandatoryField
* Purpose: This function validates mandatory form field for emptiness, if form field empty then adds user defined arg_message  to the error message array.
* Parameters: arg_fieldName - mandatory form field name, arg_message user defined message, arr_msg array .
* Return:  If empty returns false / nothing
******************************************************************/

function validateMandatoryField(arg_fieldName, arg_message)
{
  var retVal = true;
  if(arg_fieldName.type=="text" || arg_fieldName.type=="textarea" || arg_fieldName.type=="password")
  	var f_value = arg_fieldName.value;
  else
  {
  	if(arg_fieldName.type=="select-one")
  		var f_value = arg_fieldName.options[arg_fieldName.selectedIndex].value;
 	 else
  	{
   		if(arg_fieldName.type=="radio")
   		{
   			 var f_value = "";
   			if(arg_fieldName.checked)
				var f_value = "1";
   		}
   		else
   		{
   			if(arg_fieldName[0].type=="radio")
   			{
			    var f_value = "";
			    var radiolen = arg_fieldName.length;
			    for(i=0;i<=radiolen-1;i++) 
			    {
				     if(arg_fieldName[i].checked)
				     var f_value = "1";
			    }
		   	}
		}
	}
}	 
     
  if (f_value == "") 
  {
    if(arg_fieldName.type=="text" || arg_fieldName.type=="textarea" || arg_fieldName.type=="password")
  		return addErrorMsg(arg_message, arg_fieldName);
	else
	{
		if(arg_fieldName.type=="select-one")
			return addErrorMsg(arg_message, arg_fieldName);
		else
		{
			if(arg_fieldName.type=="radio")
				return addErrorMsg(arg_message, arg_fieldName);
			else
			{
				if(arg_fieldName[0].type=="radio")
					return addErrorMsg(arg_message, arg_fieldName);
			}
		}
	}

	retVal = false;
  }
  return retVal;
}
/***************************************************************
* Function Name: validateSelectBox
* Purpose: This function validates mandatory select box field for -1, 
* if select box has value -1 then adds user defined arg_message  to the error message array.
* Parameters: arg_fieldName - mandatory form field name, arg_message user defined message.
* Return:  If -1 returns false / nothing
******************************************************************/

function validateSelectBox(arg_fieldName, arg_message)
{
  var f_value = arg_fieldName.options[arg_fieldName.selectedIndex].value;

  if (f_value == "-1") 
  {
	if(arg_fieldName.type=="select-one")
	return addErrorMsg(arg_message, arg_fieldName);	
  }
  return true;
}

/***************************************************************
* Function Name: isAlphaNumeric
* Purpose: This function checks for alpha-numeric or string value, if field value is not alpha numeric or string, adds user defined arg_message to error message array and will return false.
* Parameters: arg_fieldName -form field name, arg_message - user defined error message.
* Return:  true / false
******************************************************************/

function isAlphaNumeric(arg_fieldName, arg_message)
{
  if(!(isNaN(arg_fieldName.value)))
  {
   return addErrorMsg(arg_message, arg_fieldName);
  }
}



/***************************************************************
* Function Name: validateTextboxSpace
* Purpose: This function checks for spaces [beginning and end of the string] in the value of textbox input field. If space is at beginning and end of string, adds user defined arg_message error message to error message array and will return false.
* Parameters: arg_fieldName - form field name, arg_message user defined error message.
* Return:  true / false
******************************************************************/

function validateTextboxSpace(arg_fieldName, arg_message)
{
  chkString = escape(arg_fieldName.value)
  if(chkString.substring(0,3)=="%20" || chkString.substring(chkString.length-3,chkString.length+1)=="%20")
  return addErrorMsg(arg_message, arg_fieldName);
  //if(chkString.substring(chkString.length-3,chkString.length+1)=="%20")
  //return addErrorMsg(arg_message, arg_fieldName);
}




/***************************************************************
* Function Name: removeTextboxSpaceBeginEnd
* Purpose: This function checks for spaces[beginning and end of the string] in the value of textbox input field and removes it. Work as trimming of blank spaces, before and after sting value.
* Parameters: arg_fieldName - form field name.
* Return:  Trimed String.
******************************************************************/

function removeTextboxSpaceBeginEnd(arg_fieldname)
{
 var vStr = arg_fieldname.value;
 var ilength = vStr.length;
 var cChr;
 var index;
 for(index=0;index<=ilength;index++)
 {
  cChr = vStr.charAt(index);
  if(cChr!=" ") 
  { 
   break;
  }
 }
    
 vStr = vStr.substring(index,ilength)
 ilength = vStr.length;
 for(index=ilength-1;index>=0;index--)
 {
  cChr = vStr.charAt(index);
  if(cChr!=" ") 
  { 
   break;
  }
 }
 arg_fieldname.value = vStr.substring(0,index+1);
}

/***************************************************************
* Function Name: removeGivenCharBeginEnd
* Purpose: This function checks for Given Char[beginning and end of the string] in the value of textbox input field and removes it. Work as trimming of special char, before and after sting value.
* Parameters: arg_fieldName - form field name.
* Return:  Trimed String.
******************************************************************/

function removeGivenCharBeginEnd(arg_fieldname,arg_Char)
{
 var vStr = arg_fieldname.value;
 var ilength = vStr.length;
 var cChr;
 var index;
 for(index=0;index<=ilength;index++)
 {
  cChr = vStr.charAt(index);
  if(cChr!=arg_Char) 
  { 
   break;
  }
 }
    
 vStr = vStr.substring(index,ilength)
 ilength = vStr.length;
 for(index=ilength-1;index>=0;index--)
 {
  cChr = vStr.charAt(index);
  if(cChr!=arg_Char) 
  { 
   break;
  }
 }
 arg_fieldname.value = vStr.substring(0,index+1);
}

/***************************************************************
* Function Name: validateDecimalValue
* Purpose: This function checks for allowed number of digits after decimal point. If found more than limit, adds user defined arg_message error message to error message array and return false.
* Parameters: arg_fieldName - form field name, arg_dVal - number of digits after decimal point, arg_message - user defined error message.
* Return:  true / false
******************************************************************/

function validateDecimalValue(arg_fieldname, arg_dVal, arg_message) 
{
  var fldLen = arg_fieldname.value.length;
  for(i=0;i<=fldLen-1;i++)
  {
   if(arg_fieldname.value.charAt(i)==".")
   {
    if((parseInt(fldLen-1)-i)>parseInt(arg_dVal))
	return addErrorMsg(arg_message, arg_fieldname);
   }
  }
  return true;
}



/***************************************************************
* Function Name: validateDecimalInitValue
* Purpose: This function checks for specified number of digits before & after decimal point. If found more than limit, adds user defined arg_message error message to error message array and will return false.
* Parameters: arg_fieldName - form field name, arg_dVal - number of digits after decimal point, arg_iVal - number of digits before decimal point, arg_message - user defined error message.
* Return:  true / false
******************************************************************/


function validateDecimalInitValue(arg_fieldname , arg_dVal, arg_iVal, arg_message)
{
  var fldLen = arg_fieldname.value.length;
  for(i=0;i<=fldLen-1;i++)
  {
   if(arg_fieldname.value.charAt(i)==".")
   {
    if((parseInt(fldLen-1)-i)>parseInt(arg_dVal))
	return addErrorMsg(arg_message, arg_fieldname);
	
	if((parseInt(i))>parseInt(arg_iVal))
	return addErrorMsg(arg_message, arg_fieldname);

	break;
   }
  }
  if(i == fldLen)
  {
	//This means there was no decimal. So check if the 
	//integer part is in range 
	if(parseInt(i)>parseInt(arg_iVal))
		return addErrorMsg(arg_message, arg_fieldname);
  }
  return true;
}

/***************************************************************
* Function Name: validateSpecialChar
* Purpose: This function checks for special characters, if found special character(s) other then allowed characters then adds error message to error message array and will return false.
* Parameters: arg_fieldName - form field name, arg_validChar - valid characters, arg_message - user defined error message.
* Return:  true / false
******************************************************************/

function validateSpecialChar(arg_fieldName, arg_validChar, arg_message)
{
  var amtinv = arg_fieldName.value;
  if(arg_validChar!='')
  {
  var validStr = arg_validChar;	 
  }
  else
  {
  var validStr = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  }
  //var validStr = arg_validChar;	  
  for(i=0;i<=arg_fieldName.value.length-1;i++)
  {
   //alert(validStr.indexOf(amtinv.charAt(i)));
   if(validStr.indexOf(amtinv.charAt(i))==-1)
   {
    addErrorMsg(arg_message, arg_fieldName);
    break;
   }
  }
}


/***************************************************************
* Function Name: checkSpace
* Purpose: This function checks for space in Given String from argFiled name, if found space then adds error message to error message array and will return false.
* Parameters: arg_fieldName - form field name, arg_message - user defined error message.
* Return:  true / false
******************************************************************/

function checkSpace(arg_fieldName, arg_message)
{
 var password = arg_fieldName.value;
 for(v=0;v<=password.length-1;v++)
 {
  if(escape(password.charAt(v))=="%20")
  return addErrorMsg(arg_message, arg_fieldName);
 }
}

/***************************************************************
* Function Name: checkFirstChar_Upper
* Purpose: This function checks for First Char of Given String is UpperCase. if true adds error message to error message array return false.
* Parameters: arg_fieldName - form field name, arg_message - user defined error message.
* Return:  true / false
******************************************************************/
function checkFirstChar_Upper(arg_fieldName, arg_message)
{
 var password = arg_fieldName.value;
 if(password.charAt(0)!=password.charAt(0).toUpperCase())
 {
  addErrorMsg(arg_message, arg_fieldName);
 }
}

/***************************************************************
* Function Name: checkFirstChar_Lower
* Purpose: This function checks for First Char of Given String is LowerCase. if true adds error message to error message array return false.
* Parameters: arg_fieldName - form field name, arg_message - user defined error message.
* Return:  true / false
******************************************************************/
function checkFirstChar_Lower(arg_fieldName, arg_message)
{
 var password = arg_fieldName.value;
 if(password.charAt(0)!=password.charAt(0).toLowerCase())
 {
  addErrorMsg(arg_message, arg_fieldName);
 }
}


/***************************************************************
* Function Name: isMustAlphaNumeric
* Purpose: This function validates if Given String Contains both Alpha-Numeric Entry. if true return, else adds error message to error message array and return false.
* Parameters: arg_fieldName - form field name, arg_message - user defined error message.
* Return:  true / false
******************************************************************/
function isMustAlphaNumeric(arg_fieldName, arg_message)
{
 var numericFlag = false;
 var stringFlag = false;
 var str = arg_fieldName.value;

 for(i=0;i<=str.length-1;i++)
 {
  if(str.charAt(i) == " ")
  continue;  
  if(!(isNaN(str.charAt(i))))
  stringFlag = true;
 }

 if(isNaN(arg_fieldName.value))
 numericFlag = true;
 if(numericFlag==true && stringFlag==true)
 return;
 else
 return addErrorMsg(arg_message, arg_fieldName);
}


/***************************************************************
* Function Name: checkFirstletterChar
* Purpose: This function validates if Given String Contains First Letter Char. if true void, else adds error message to error message array and return false.
* Parameters: arg_fieldName - form field name, arg_message - user defined error message.
* Return:  true / false
******************************************************************/
function checkFirstletterChar(arg_fieldName, arg_message)
{
 var password = arg_fieldName.value;
 if(!(isNaN(password.charAt(0))))
 return addErrorMsg(arg_message, arg_fieldName);
}

/**************************************************************************
	compareDates will compare whether fromDt(dd/mm/yyyy) is less than toDt(dd/mm/yyyy). If no
	error message
***************************************************************************/
function compareDates(fromDt,toDt,arg_msg)
{
	 var From_Date = fromDt;
	 var To_Date = toDt;

 if(From_Date.value!='' || To_Date.value!='')
	 {
	  
	var frmdate_val = From_Date.value;
	var frstIndx = frmdate_val.indexOf('/');
	var frmdate = frmdate_val.substring(0,frstIndx); 	  
	var sndIndx = frmdate_val.lastIndexOf('/');
    var frmmonth = frmdate_val.substring(frstIndx+1,sndIndx);
	var frmyear = frmdate_val.substring(sndIndx+1,frmdate_val.length);
	var todate_val = To_Date.value;
	frstIndx = todate_val.indexOf('/');
	var todate = todate_val.substring(0,frstIndx); 
	sndIndx = todate_val.lastIndexOf('/');
	var tomonth = todate_val.substring(frstIndx+1,sndIndx);
    var toyear = todate_val.substring(sndIndx+1,todate_val.length);
 		
 		if(parseFloat(toyear)<parseFloat(frmyear))
 		{
  			addErrorMsg(arg_msg, From_Date);
  		}
  		else
  		{
  			 if(parseFloat(toyear)==parseFloat(frmyear))
   				{
    				if(parseFloat(tomonth)<parseFloat(frmmonth))
    					{
    						addErrorMsg(arg_msg, From_Date);
						}
						else
						{
							if(parseFloat(tomonth)==parseFloat(frmmonth))
							{
	 							if(parseFloat(todate)<parseFloat(frmdate))
	 							{
	 								addErrorMsg(arg_msg, From_Date);
	 							}
							} 
   						 } 
  				}
 		}
 	}
} // end function compareDates

/**************************************************************************
	compareDateValues will compare whether fromDt (yyyy-mm-dd) is less than toDt(yyyy-mm-dd). If no
	error message
***************************************************************************/
function compareDateValues(fromDt,toDt,arg_msg)
{
	 var From_Date = fromDt;
	 var To_Date = toDt;

 if(From_Date.value!='' || To_Date.value!='')
	 {
	  
	var frmdate_val = From_Date.value;
	var frstIndx = frmdate_val.indexOf('-');
	var frmyear = frmdate_val.substring(0,frstIndx); 
	var sndIndx = frmdate_val.lastIndexOf('-');
	var frmmonth = frmdate_val.substring(frstIndx+1,sndIndx);
    var frmdate = frmdate_val.substring(sndIndx+1,frmdate_val.length);
	
	var todate_val = To_Date.value;
	
	frstIndx = todate_val.indexOf('-');
	var toyear = todate_val.substring(0,frstIndx); 
	sndIndx = todate_val.lastIndexOf('-');
	var tomonth = todate_val.substring(frstIndx+1,sndIndx);
    var todate = todate_val.substring(sndIndx+1,todate_val.length);
 		
 		if(parseFloat(toyear)<parseFloat(frmyear))
 		{
  			addErrorMsg(arg_msg, From_Date);
  		}
  		else
  		{
  			 if(parseFloat(toyear)==parseFloat(frmyear))
   				{
    				if(parseFloat(tomonth)<parseFloat(frmmonth))
    					{
    						addErrorMsg(arg_msg, From_Date);
						}
						else
						{
							if(parseFloat(tomonth)==parseFloat(frmmonth))
							{
	 							if(parseFloat(todate)<parseFloat(frmdate))
	 							{
	 								addErrorMsg(arg_msg, From_Date);
	 							}
							} 
   						 } 
  				}
 		}
 	}
} // end function compareDateValues

/**************************************************************************
	checkDateFormat will check the date format in (yyyy-mm-dd). If no
	error message
***************************************************************************/
function checkDateFormat(str_date,strMsg)
	{	
		var arr_date = str_date.split('-');
		if (arr_date.length != 3) return addErrorMsg(strMsg);
		if (!arr_date[2]) return addErrorMsg(strMsg);
		if (!RE_NUM.exec(arr_date[2])) return addErrorMsg(strMsg);
		if (!arr_date[1]) return addErrorMsg(strMsg);
		if (!RE_NUM.exec(arr_date[1])) return addErrorMsg(strMsg);
		if (!arr_date[0]) return alert (strMsg);
		if (!RE_NUM.exec(arr_date[0])) return addErrorMsg(strMsg);
		var dt_date = new Date();
		dt_date.setDate(1);
		if (arr_date[1] < 1 || arr_date[1] > 12) return addErrorMsg(strMsg);
		dt_date.setMonth(arr_date[1]-1);
		if (arr_date[0] < 100) arr_date[0] = Number(arr_date[0]) + (arr_date[0] < NUM_CENTYEAR ? 2000 : 1900);
		dt_date.setFullYear(arr_date[0]);
		var dt_numdays = new Date(arr_date[0], arr_date[1], 0);
		dt_date.setDate(arr_date[2]);
		if (dt_date.getMonth() != (arr_date[1]-1)) return addErrorMsg(strMsg);
		return (dt_date)
  }// end function checkDateFormat 
  
  
/**************************************************************************
	Date validation for 3 seperate text boxes - DD/MM/YYYY
	Calendar not used.
***************************************************************************/
var b="true";

function chkdate(sDate)
{
var strDate;
var strDateArray;
var strDay;
var strMonth;
var strYear;
var intday;
var intMonth;
var intYear;
var booFound = false;
var datefield = sDate;
var strSeparatorArray = new Array("/");
var intElementNr;
var err = 0;
var strMonthArray = new Array(12);
strDate = sDate;

if (strDate.length < 1) {
return true;
}

for (intElementNr = 0; intElementNr < strSeparatorArray.length; intElementNr++) 
{
	
	if (strDate.indexOf(strSeparatorArray[intElementNr])!= -1)
	{
		strDateArray = strDate.split(strSeparatorArray[intElementNr]);
		if (strDateArray.length != 3) 
		{
			err = 1;
			return false;
		}
		else 
		{
			strMonth = strDateArray[1];
			strDay = strDateArray[0];		//for DD/MM/YYYY
			strYear = strDateArray[2];


		}
		booFound = true;
   }
   else 
	return false;
}

if (booFound == false) {
if (strDate.length>5) {
strDay = strDate.substr(2, 4);
strMonth = strDate.substr(0, 2);
strYear = strDate.substr(4);
   }
}
if(strYear < 1900){
//addErrorMsg("Year less than 1000 is not allowed");
b="false";
return false;
}

if (isNaN(strYear)){
err = 18;
return false;
}
 
if (strYear.length == 2) {
err = 12;
return false;
}

else {
if (strYear.length == 1 || strYear.length == 3 || strYear.length > 4) {
err = 11;
return false;
}
//else
//strYear = strDate.substr(4);
}
if (isNaN(strDay)) {
err = 2;
return false;
}
intday = parseInt(strDay, 10);
if (isNaN(intday)) {
err = 2;
return false;
}
if (isNaN(strMonth)) {
err = 3;
return false;
   }
intMonth = parseInt(strMonth, 10);
if (isNaN(intMonth)) {
err = 3;
return false;
   }

intYear = parseInt(strYear, 10);
if (isNaN(intYear)) {
err = 4;
return false;
}
if (intMonth>12 || intMonth<1) {
err = 5;
return false;
}
if ((intMonth == 1 || intMonth == 3 || intMonth == 5
|| intMonth == 7 || intMonth == 8 || intMonth == 10 ||
intMonth == 12) && (intday > 31 || intday < 1)) {
err = 6;
return false;
}
if ((intMonth == 4 || intMonth == 6 || intMonth == 9
|| intMonth == 11) && (intday > 30 || intday < 1)) {
err = 7;
return false;
}
if (intMonth == 2) {
if (intday < 1) {
err = 8;
return false;
}
if (LeapYear(intYear) == true) {
if (intday > 29) {
err = 9;
return false;
}
}
else {
if (intday > 28) {
err = 10;
return false;
}
}
}

if(strDay.length<1){
err=15;
return  false;
}

if(strMonth.length<1){
err=16;
return  false;
}

return true;
}

function LeapYear(intYear) {
if (intYear % 100 == 0) {
if (intYear % 400 == 0) { return true; }
}
else {
if ((intYear % 4) == 0) { return true; }
}
return false;
}
/***************************************************************
* Function Name: getNumValFromFormattedString
* Purpose: This function returns the value of the field with commas removed in between.
* Parameters: arg_fieldName - form field.
* Return: String with commas removed in between.
******************************************************************/
function getNumValFromFormattedString (arg_field)
{
	var numericValue = "";
	var fieldValue = arg_field.value;
	for (var i = 0; i < fieldValue.length; i++)
	{
		if (fieldValue.charAt (i) != ',')
		{
			numericValue += fieldValue.charAt (i);
		}
	}
	return numericValue;
}

/***************************************************************
* Function Name: isValidNumFormattedValue
* Purpose: This function returns where the value of the field has valid numeric value with commas in between.
* Parameters: arg_fieldName - form field, arg_message - the error message to be set.
* Return: true/false
******************************************************************/
function isValidNumFormattedValue (arg_field, arg_msg)
{
	var retValue = true;
	var numericValue = getNumValFromFormattedString (arg_field);

	if (numericValue == "" || isNaN (numericValue))
	{
		addErrorMsg (arg_msg, arg_field);
		retValue = false;
	}
	return retValue;
}

/***************************************************************
* Function Name: isWithinRange
* Purpose: This function returns where the value of the field is within the range specified. The last two 
* arguments specify whether the minimum and maximum values are inclusive or not.
* Parameters: arg_fieldName - form field, arg_message - the error message to be set.
* arg_maxInclusive - whether arg_maxVal is inclusive, arg_minInclusive - whether arg_minVal is inclusive
* Return: true/false
******************************************************************/
function isWithinRange (arg_field, arg_msg, arg_maxVal, arg_minVal, arg_maxInclusive, arg_minInclusive)
{
	var retValue = true;
	var maxVal = arg_maxVal - 0;
	var minVal = arg_minVal - 0;
	var numericValue = getNumValFromFormattedString (arg_field);

	if (numericValue == "" || isNaN (numericValue))
	{
		retValue = false;
	}
	else 
	{
		if (arg_maxInclusive == true)
		{
			if (numericValue > maxVal)
			{
				retValue = false;
			}
		}
		else
		{
			if (maxVal < numericValue)
			{
				retValue = false;
			}
		}
		if (retValue == true)
		{
			if (arg_minInclusive == true)
			{
				if (numericValue < minVal)
				{
					retValue = false;
				}
			}
			else
			{
				if (numericValue <= minVal)
				{
					retValue = false;
				}
			}
		}
	}
	if (retValue == false)
	{
		addErrorMsg (arg_msg, arg_field);
	}
}

/***************************************************************
* Function Name: checkTextAreaLength
* Purpose: This function checks the length of the txtarea form field for a particular length, if the length of form field is greater than adds user defined arg_message  to the error message array. 
* Parameters: arg_fieldName - txtarea form field name,  arg_length maximum length allowed, arg_message user defined message.
* Return:  If empty returns false / nothing
******************************************************************/

function checkTextAreaLength(arg_fieldName, arg_length, arg_message)
{
	var retValue = true;
	if(arg_fieldName.value.length > arg_length)
	{
	   addErrorMsg(arg_message,arg_fieldName);
//	   arg_fieldName.focus();
	   retValue = false;
	}
	return retValue;
}

/***************************************************************
* Function Name: checkTextMaxLength
* Purpose: This function checks the length of the text form field for a particular length, if the length of form field is greater than adds user defined arg_message  to the error message array. 
* Parameters: arg_fieldName - txt form field name,  arg_length maximum length allowed, arg_message user defined message.
* Return:  If empty returns false / nothing
******************************************************************/

function checkTextMaxLength(arg_fieldName, arg_length, arg_message)
{
	var retValue = true;
	if(arg_fieldName.value.length > arg_length)
	{
	   addErrorMsg(arg_message,arg_fieldName);
//	   arg_fieldName.focus();
	   retValue = false;
	}
	return retValue;
}

/***************************************************************
* Function Name: checkTextMinLength
* Purpose: This function checks the length of the text form field for a particular length, if the length of form field is less than adds user defined arg_message  to the error message array. 
* Parameters: arg_fieldName - txt form field name,  arg_length minimum length allowed, arg_message user defined message.
* Return:  If empty returns false / nothing
******************************************************************/

function checkTextMinLength(arg_fieldName, arg_length, arg_message)
{
	var retValue = true;
	if(arg_fieldName.value.length < arg_length)
	{
	   addErrorMsg(arg_message,arg_fieldName);
//	   arg_fieldName.focus();
	   retValue = false;
	}
	return retValue;
}

/***************************************************************
* Function Name: checkDecimalPlaces
* Purpose: This function checks the number of decimal places of the form field value , if it is greater arg_limit than adds user defined arg_message  to the error message array. 
* Parameters: arg_fieldName - form field name,  arg_limitthe number of decimal places allowed, arg_message user defined message.
* Return:  If empty returns false / nothing
******************************************************************/

function checkDecimalPlaces(arg_fieldName, arg_limit, arg_message)
{
	var fieldValue = arg_fieldName.value;
	var valueLength = fieldValue.length;
	var decimalPosition = fieldValue.indexOf (".", 0);
	if (decimalPosition != -1)
	{
		valueLength = valueLength - 1;
		if ((valueLength - decimalPosition) > arg_limit)
		{
			addErrorMsg (arg_message, arg_fieldName);
		}
	}
}

/***************************************************************
* Function Name	: Trim_LeadSpaces(frmName)
* Purpose	: This function trims the leading space from all the elements of given form
* Parameters	: Form Name
* Return	: none
******************************************************************/

function Trim_LeadSpaces(frmName)
{       
	for(var i=0;i<frmName.length;i++)
	{
		var selement=frmName.elements[i];
		if((selement.type=="text")||(selement.type=="textarea"))
		{
			while(''+frmName.elements[i].value.charAt(0)==' ')
				frmName.elements[i].value=frmName.elements[i].value.substring(1,frmName.elements[i].value.length);

			var last = frmName.elements[i].value.length;
			while(''+frmName.elements[i].value.charAt(last-1)==' ')
			{
			  frmName.elements[i].value=frmName.elements[i].value.substring(0,last-1);
			  last = frmName.elements[i].value.length;
			}
		}
	}
	return;  
}


function dateIsBefore(date1, date2)
{
		 var d1 = new Date(date1);
		 var d2 = new Date(date2);
		 return (d1<d2);
}

/***************************************************************
* Function Name: checkKeyPress
* Purpose: This function is called onkeypress event and checks whether the current key press is a | symbol. And if it is a pipe symbol then it discards its value.
* Parameters: arg_evt - it is the event object while pressing the key on the field.
******************************************************************/
function checkKeyPress(arg_evt, key)
{
	if(arg_evt.keyCode == key)
		arg_evt.keyCode = null;
}

/***************************************************************
* Function Name: validateFieldForSpecialChar
* Purpose: This function checks for special characters, if found invalid special character(s) then adds error message to error message array and will return false.
* Parameters: arg_fieldName - form field name, arg_invalidChar - valid characters, arg_message - user defined error message.
* Return:  true / false
******************************************************************/

function validateFieldForSpecialChar(arg_fieldName, arg_invalidChars, arg_message)
{
	var amtinv = arg_fieldName.value;
	for(i=0;i<=arg_fieldName.value.length-1;i++)
	{
		if(arg_invalidChars.indexOf(amtinv.charAt(i))!=-1)
		{
			addErrorMsg(arg_message, arg_fieldName);
			break;
		}
	}
}

/***************************************************************
* Function Name: adjustHeightOfTD
* Purpose: This function is called from jsp to adjust the two lines in the <TD> so that they should not wrap
* Parameters: arg_obj - it is the event object while pressing the key on the field.
			  arg_oneLineHeight - number - height of the one line (24 in generic case)	
			  arg_twoLineHeight - number - height of the two line (30 in generic case)	
******************************************************************/
function adjustHeightOfTD(obj, arg_oneLineHeight, arg_twoLineHeight)
{
	if(obj.clientHeight > arg_twoLineHeight)
	{
		var txt = obj.innerText;
		var arr = txt.split("\r\n");
		obj.innerText = arr[0];
		while(obj.clientHeight > arg_oneLineHeight)
		{
			var ind = arr[0].lastIndexOf(" ", (arr[0].length-5));
			if(ind != -1)
			{
				var temp = arr[0].substring(ind+1);
				arr[0] = arr[0].substring(0, ind);
				arr[1] = temp + " " + arr[1];
			}
			obj.innerText = arr[0];
		}
		obj.innerText = arr.join("\r\n");
		while(obj.clientHeight > arg_twoLineHeight)
		{
			var ind = arr[1].lastIndexOf(" ", (arr[1].length-5));
			if(ind != -1)
			{
				arr[1] = arr[1].substring(0, ind);
				obj.innerText = arr.join("\r\n");
			}
		}
	}
}
var cons_k = 140;
var cons_m = 25;
var cons_max = 240;
//Function : showErrors
//purpose  : To show error pop-ups.
function showErrors(error)
{
 
  var str ="<html>";
  
  str+="<head>";
  str+="<link href='resources/css/litappstylesheet.css' type='text/css' rel='stylesheet'>";
  
 
  str+="<title>";
  str+="Information/Errors/Warning Window";
  str+="</title><script>function checkKey(){ var key = event.keyCode; if (key == 13){ event.returnValue=false; } }</script>";
  str+="</head>";
  
  str+="<body onKeyPress='checkKey();'>";
  str+="<form name='dummy' action='dummyAction'>"

  if ( error.length > 0 )
  {
    str+="<table width='100%' cellspacing='0' cellpadding='0' class='msgtable'>";
    str+="  <tr >";
	str+=" <td ><img src='resources/images/warningicon_pagetitle.jpg' /></td>";
	str+=" <td align='right'><img src='resources/images/logo_popwindow.gif' /></td>";
    str+="  </tr>";
	str+="  </table>";
	
	str+="  <table width='100%' >";
    str+="  <tr >";
    str+="  </tr>";
		for(var i = 0; i < error.length ; i++)
		{
			if(i%2==0)
			{
				str+="  <tr class='msgRow2' >";
			}
			else
			{
				str+="  <tr class='msgRow1' >";
			}
			str+="  <td width='100%' align='left'>";
			str+= i+1;
			str+=". " + error[i];
			str+="  </td>";
			str+="  </tr>";
			str+="  </tr>";
		}
		str+="  <tr >";
		str+="  </tr>";
		str+="  <tr align='right' >";
		str+="  <td class='msgtdbutton'><input type='button' value= " +btn_text+ " onclick='window.close();' Class='buttonGrey'/></td>";
		str+="  </tr>";
		str+="</table>";
  }
  str+="</form>"
  str+="</body>";
  str+="</html>";
  
  
  p = cons_k+(cons_m*i);
  if(p > cons_max){
	p = cons_max;
  }
  showModalWin("",460,p,"yes","no","no",str); // call show modal dialog for modal window 
}

//Function : showModalWin()
//Purpose  : opens a modal dialog box for errro pop-ups(client side)
function showModalWin(url, width, height,resizable,scroll,status,arguments)
{
  var param = "dialogHeight:"+height+"px;dialogWidth:"+width+"px;center:yes;resizable:"+resizable+";status:"+status+";scroll:"+scroll+";help:no";
  var r= showModalDialog("\error.htm",arguments,param);
  return r;
  
}


/***************************************************************
* Function Name: isPositiveInteger
* Purpose: This function checks for positive value in the given form field.
* Parameters: arg_fieldName - form field name, arg_message - user defined message.
* Return:  If negative adds error message to error message array and will returns false / If value is positive return true.
******************************************************************/


function isLengthCorrect(arg_fieldName,arg_size, arg_message)
{
  var fldlen = arg_fieldName.value.length;
  if(fldlen>arg_size)
  {
     return addErrorMsg(arg_message, arg_fieldName); 
  }
  return true;
}



/***************************************************************
* Function Name: validateTimeField
* Purpose: This function validates for time fields in format hh:mm:ss, if false then adds user defined arg_message  to the error message array.
* Parameters: arg_fieldName - mandatory form field name, arg_message user defined message.
* Return:  If empty returns false / nothing
******************************************************************/

function validateTimeField(arg_fieldName, arg_message)
{
	var retVal = true;
	str=new Array();
	var time = arg_fieldName.value;
	if(time.length==8)
	{	
		str=time.split(":");
		if(str.length==3)
		{
			hh=str[0];
			mm=str[1];
			ss=str[2];
			if((hh.length==2)&&(mm.length==2)&&(ss.length==2))
			{
			
				for(firstCounter=0;firstCounter<=2;firstCounter++)
				{
					for(secondCounter=0;secondCounter<2;secondCounter++)
					{
						temp=str[firstCounter].substring(secondCounter,secondCounter+1);
						if(isNaN(temp))
						{
							return addErrorMsg(arg_message, arg_fieldName);
							retVal = false;
						}
					}
				}
				
				
				if(hh>=0 && hh<24)
					{
					
					if(mm>=0 && mm<60)
					{
						if(ss>=0 && ss<60)
						{retVal=true;
						return retVal;}
						else
						{
							return addErrorMsg(arg_message, arg_fieldName);
							retVal = false;
						}
					}
					else
					{
						return addErrorMsg(arg_message, arg_fieldName);
						retVal = false;
					}
				}
				else
				{
					return addErrorMsg(arg_message, arg_fieldName);
					retVal = false;
				}
			}
			else
			{
				return addErrorMsg(arg_message, arg_fieldName);
				retVal = false;
			}
		
		}
		else
		{
			return addErrorMsg(arg_message, arg_fieldName);
			retVal = false;
		}
	}
	else
	{
		return addErrorMsg(arg_message, arg_fieldName);
		retVal = false;
	}
	return retVal;
 }
 
 function isOneRowSelected(arg_fieldName,arg_message){
	
		if(to_check==1)
		{
			var i = arg_fieldName.length;
			var k=0;
			if(i!=null)
			{
				for(var j=0; j<i;j++){
					if(arg_fieldName[j].checked){
						 k=1;
					}
				}
			}
			else if (arg_fieldName.checked)
			{
				k=1;
			}
			
			if (k==0)
			{
				return showErrorsForSingleRecord(arg_message);
			}
			else
			{
				return true;
			}
		}
		return false;
	}
	
	
function showErrorsForSingleRecord(error)
{
  var str ="<html>";
  str+="<head>";
  str+="<link href='resources/css/litappstylesheet.css' type='text/css' rel='stylesheet'>";
  str+="<title>";
  str+="Information/Errors/Warning window";
  str+="</title><script>function checkKey() { var key = event.keyCode; if (key == 13) { event.returnValue=false; } }</script>";
  str+="</head>";
  
  str+="<body onKeyPress='checkKey();' >";
  str+="<form name='dummy' action='dummyAction'>"
    str+="<table width='100%' cellspacing='0' cellpadding='0' class='msgtable'>";
    str+="  <tr >";
    
    str+=" <td ><img src='resources/images/warningicon_pagetitle.jpg'/></td>";
    str+=" <td align='right'><img src='resources/images/logo_popwindow.gif'/></td>";
    str+="  </tr>";
	str+="  </table>";
	str+="  <table width='100%'>";
    str+="  <tr >";
    str+="  </tr>";
    str+="  <tr  class='msgRow2' >";
    str+="    <td width='100%' align='left'>";
    str+="1. " + error;
	str+="  </td>";
	str+="  </tr>";
	
	str+="  <tr align='right'>";
	str+="  <td class='msgtdbutton'><input type='button' value='OK' onclick='window.close();' Class='buttonGrey'/></td>";
	str+="  </tr>";
	str+="</table>";
  
  str+="</form>"
  str+="</body>";
  str+="</html>";
  p = cons_k+(cons_m*2);
  if(p > cons_max){
	p = cons_max;
  }
  showModalWin("",460,p,"yes","no","no",str); // call show modal dialog for modal window
  return false;
}

// function remove text box white space 
function removeTextboxSpaceBeginEndForAllForm(form_name) {

    for (i = 0; i<document.form_name.elements.length; i++) {
        if ((document.form_name.elements[i].type == 'text' && document.form_name.elements[i].value != '')) {
 			document.form_name.elements[i].value= trim(document.form_name.elements[i].value);		  
        }
	}
}
// function trim 
function trim(str) {                            
	// remove leading spaces 
    while (str.substring(0,1) == ' ') 
        str = str.substring(1, str.length);
    // remove trailing spaces 
    while (str.substring(str.length-1,str.length) == ' ')
        str = str.substring(0, str.length-1);
   return str;
} 


function  displayErrorWarnings()
{
var k = showWarnings(error);
return k
}


function showWarnings(error)
{
 
  var str ="<html>";
  str+="<head>";
  str+="<link href='resources/css/litappstylesheet.css' type='text/css' rel='stylesheet'>";
 
  str+="<title>";
  str+="Information/Errors/Warning window";
  str+="</title><script>function okClick(){window.returnValue=true;window.close();}function cancelClick(){window.returnValue=false;window.close();}function closeClick(){if(window.returnValue!=true&&window.returnValue!=false)window.returnValue=true;window.close();}function checkKey() { var key = event.keyCode; if (key == 13) { event.returnValue=false; }}</script>";
  str+="</head>";
  
  str+="<body onUnload='return closeClick()' onKeyPress='checkKey();'>";
  str+="<form name='dummy' action='dummyAction'>"

  if ( error.length > 0 )
  {
    str+="<table width='100%' cellspacing='0' cellpadding='0' class='msgtable'>";
    str+="  <tr >";
    
    str+=" <td ><img src='resources/images/warningicon_pagetitle.jpg'/></td>";
    str+=" <td align='right'><img src='resources/images/logo_popwindow.gif'/></td>";
    str+="  </tr>";
	str+="  </table>";
	 str+="  <table width='100%'>";

    str+="  <tr >";
   
    str+="  </tr>";
		for(var i = 0; i < error.length ; i++)
		{
			if(i%2==0)
			{
				str+="  <tr class='msgRow2' >";
			}
			else
			{
				str+="  <tr class='msgRow1' >";
			}
			str+="    <td width='100%' align='left'>";
			str+= i+1;
			str+=". " + error[i];
			str+="  </td>";
			str+="  </tr>";

		}
		str+="  <tr align='right'>";
		str+="  <td class='msgtdbutton'><input type='button' value="+ btn_text_yes +" onclick='return cancelClick();' Class='buttonGrey' />&nbsp;&nbsp;<input type='button' value="+btn_text_no+" onclick='return okClick();' Class='buttonGrey' /></td>";
		str+="  </tr>";
		str+="</table>";
  }
  str+="</form>"
  str+="</body>";
  str+="</html>";
  p = cons_k+(cons_m*i);
  if(p > cons_max){
	p = cons_max;
  }
  var xx = showModalWin("",460,p,"yes","no","no",str); // call show modal dialog for modal window
  return xx;
 
}
function showInfoMessage(error)
{
  var str ="<html>";
  str+="<head>";
  str+="<link href='resources/css/litappstylesheet.css' type='text/css' rel='stylesheet'>";
  str+="<title>";
  str+="Information/Errors/Warning window";
  str+="</title> <script>function checkKey() { var key = event.keyCode; if (key == 13) { event.returnValue=false; } }</script>";
  str+="</head>";
  
  str+="<body onKeyPress='checkKey();' >";
  str+="<form name='dummy' action='dummyAction'>"
    str+="<table width='100%' cellspacing='0' cellpadding='0' class='msgtable'>";
    str+="  <tr >";
    
    str+=" <td ><img src='resources/images/warningicon_pagetitle.jpg'/></td>";
    str+=" <td align='right'><img src='resources/images/logo_popwindow.gif'/></td>";
    str+="  </tr>";
	str+="  </table>";
	str+="  <table width='100%'>";
    str+="  <tr >";
    str+="  </tr>";
    str+="  <tr class='msgRow2' >";
    str+="    <td width='100%' align='left'>";
    str+="1. " + error;
	str+="  </td>";
	str+="  </tr>";
	str+="  <tr align='right'>";
	str+="  <td class='msgtdbutton'><input type='button' value='  OK  ' onclick='window.close();' Class='buttonGrey'/></td>";
	str+="  </tr>";
	str+="</table>";
  
  str+="</form>"
  str+="</body>";
  str+="</html>";
  p = cons_k+(cons_m*2);
  if(p > cons_max){
	p = cons_max;
  }
  showModalWin("",460,p,"yes","yes","no",str); // call show modal dialog for modal window
  return false;
}
function showInfoMessageExpedite(error)
{
  var str ="<html>";
  str+="<head>";
  str+="<link href='resources/css/litappstylesheet.css' type='text/css' rel='stylesheet'>";
  str+="<title>";
  str+="Information/Errors/Warning window";
  str+="</title> <script>function checkKey() { var key = event.keyCode; if (key == 13) { event.returnValue=false; } }</script>";
  str+="</head>";
  
  str+="<body onKeyPress='checkKey();' >";
  str+="<form name='dummy' action='dummyAction'>"
    str+="<table width='100%' cellspacing='0' cellpadding='0' class='msgtable'>";
    str+="  <tr >";
    
    str+=" <td ><img src='resources/images/warningicon_pagetitle.jpg'/></td>";
    str+=" <td align='right'><img src='resources/images/logo_popwindow.gif'/></td>";
    str+="  </tr>";
	str+="  </table>";
	str+="  <table width='100%'>";
    str+="  <tr >";
    str+="  </tr>";
    str+="  <tr class='msgRow2' >";
    str+="    <td width='100%' align='left'>";
    str+="1. " + error;
	str+="<div width='90%' align='right'><input type='button' value='  OK  ' onclick='window.close();' Class='buttonGrey'/> </div>  </td>";
	str+="  </tr>";
	str+="</table>";
  
  str+="</form>"
  str+="</body>";
  str+="</html>";
  p = cons_k+(cons_m*2);
  if(p > cons_max){
	p = cons_max;
  }
  showModalWin("",670,305,"yes","yes","no",str); // call show modal dialog for modal window
  return false;
}