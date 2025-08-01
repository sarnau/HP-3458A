//************************************************************************************
// Copyright (C) 2006, Massimo Beatini
//
// This software is provided "as-is", without any express or implied warranty. In 
// no event will the authors be held liable for any damages arising from the use 
// of this software.
//
// Permission is granted to anyone to use this software for any purpose, including 
// commercial applications, and to alter it and redistribute it freely, subject to 
// the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not claim 
//    that you wrote the original software. If you use this software in a product, 
//    an acknowledgment in the product documentation would be appreciated but is 
//    not required.
//
// 2. Altered source versions must be plainly marked as such, and must not be 
//    misrepresented as being the original software.
//
// 3. This notice may not be removed or altered from any source distribution.
//
//************************************************************************************

//
// global variables
//
var isMozilla;
var objDiv = null;
var objDivFrame= null;
var originalDivHTML = "";
var DivID = "";
var iFrame = "";
var over = false;

//
// dinamically add a div to 
// dim all the page
//
function buildDimmerDiv()
{
    //document.write('<div id="dimmer" class="dimmer" style="width:'+ window.screen.width + 'px; height:' + 2668 +'px"></div>');
    document.write('<div id="dimmer" class="dimmer" style="width:'+ 100 + '%; height:' + 100 +'%"></div>');
}


//
//
//
function displayFloatingDiv(divId, title, width, height, left, top) 
{
	DivID = divId;
    iFrame = frameId;
	
	//document.getElementById('dimmer').style.visibility = "visible";
	document.getElementById(divId).style.width = width + 'px';
    document.getElementById(divId).style.height = height + 'px';
    document.getElementById(divId).style.left = left + 'px';
    document.getElementById(divId).style.top = top + 'px';
	
	var addHeader="";
	
	if (originalDivHTML == "")
	    originalDivHTML = document.getElementById(divId).innerHTML;
	
	


addHeader = '<table width="100%%"  style="width:529px" class="floatingHeader">' +
	            '<tr ><td width ="70%"ondblclick="void(0);" onmouseover="over=true;" onmouseout="over=false;" style="cursor:move;height:10px">' + title + '</td>' + 
	            '<td  style="width:30%" align="right"><a href="javascript:hiddenFloatingDiv1(\'' + divId + '\' ,\'' + iFrame + '\' );void(0);">' + 
	            '<img alt="Close..." title="Close..." src="resources/images/close.JPG" border="0"></a></td></tr></table>';
	

    // add to your div an header	
	document.getElementById(divId).innerHTML = originalDivHTML;
	
	
	document.getElementById(divId).className = 'dimming';
	document.getElementById(divId).style.visibility = "visible";




}

function displayFloatingDiv(divId, title, width, height, left, top, frameId) 
{
		
	DivID = divId;
    iFrame = frameId;
	
	
	 document.getElementById(divId).style.width = width + 'px';
    document.getElementById(divId).style.height = height + 'px';
    document.getElementById(divId).style.left = left + 'px';
    document.getElementById(divId).style.top = top + 'px';
	
	var addHeader="";
	
	if (originalDivHTML == "")
	
	    originalDivHTML = document.getElementById(divId).innerHTML;

	
	

addHeader = '<table width="100%"  style="width:528px" class="floatingHeader">' +
	            '<tr ><td width ="80%"ondblclick="void(0);" onmouseover="over=true;" onmouseout="over=false;" style="cursor:move;height:10px">' + title + '</td>' + 
	            '<td  style="width:20%" align="right"><a href="javascript:hiddenFloatingDiv1(\'' + divId + '\' ,\'' + iFrame + '\' );void(0);">' + 
	            '<img alt="Close..." title="Close..." src="resources/images/close.JPG" border="0"></a></td></tr></table>';
	

    // add to your div an header	
	document.getElementById(divId).innerHTML = originalDivHTML;
	
	
	document.getElementById(divId).className = 'dimming';
	document.getElementById(divId).style.visibility = "visible";
	 document.getElementById(iFrame).style.display = "block";
	 document.getElementById(iFrame).style.top = (top) + 'px';




}
//
//
//
function displayFloatingDivforMsg(divId, title, width, height, left, top, frameId) 
{
		
	DivID = divId;
    iFrame = frameId;
	
	
	 document.getElementById(divId).style.width = width + 'px';
    document.getElementById(divId).style.height = height + 'px';
    document.getElementById(divId).style.left = left + 'px';
    document.getElementById(divId).style.top = top + 'px';
	
	var addHeader="";
	
	if (originalDivHTML == "")
	
	    originalDivHTML = document.getElementById(divId).innerHTML;

	
	

addHeader = '<table width="100%"  style="width:533px" class="floatingHeader">' +
	            '<tr ><td width ="80%"ondblclick="void(0);" onmouseover="over=true;" onmouseout="over=false;" style="cursor:move;height:10px">' + title + '</td>' + 
	            '<td  style="width:20%" align="right"><a href="javascript:hiddenFloatingDiv1(\'' + divId + '\' ,\'' + iFrame + '\' );void(0);">' + 
	            '<img alt="Close..." title="Close..." src="resources/images/close.JPG" border="0"></a></td></tr></table>';
	

    // add to your div an header	
	document.getElementById(divId).innerHTML = originalDivHTML;
	
	
	document.getElementById(divId).className = 'dimming';
	document.getElementById(divId).style.visibility = "visible";
	 document.getElementById(iFrame).style.display = "block";
	 document.getElementById(iFrame).style.top = (top) + 'px';




}

/*
function MouseDown(e) 
{
    if (over)
    {
        if (isMozilla) {
            objDiv = document.getElementById(DivID);
            X = e.layerX;
            Y = e.layerY;
            return false;
        }
        else {
            objDiv = document.getElementById(DivID);
            objDiv = objDiv.style;
            X = event.offsetX;
            Y = event.offsetY;
        }
    }
}

*/

function MouseDown(e) 
{
    if (over)
    {
        if (isMozilla) {
            objDiv = document.getElementById(DivID);
            X = e.layerX;
            Y = e.layerY;
            return false;
        }
        else {
            objDiv = document.getElementById(DivID);
	        objDivFrame = document.getElementById(iFrame);
            objDiv = objDiv.style;
            objDivFrame = objDivFrame.style;
            X = event.offsetX;
            Y = event.offsetY;
        }
    }
}


function MouseMove(e) 
{
    if (objDiv) {
        if (isMozilla) {
            objDiv.style.top = (e.pageY-Y) + 'px';
            objDiv.style.left = (e.pageX-X) + 'px';
            return false;
        }
        else 
        {
            objDiv.pixelLeft = event.clientX-X + document.body.scrollLeft;
            objDiv.pixelTop = event.clientY-Y + document.body.scrollTop;
			objDivFrame.pixelLeft = event.clientX-X + document.body.scrollLeft;
            objDivFrame.pixelTop = event.clientY-Y + document.body.scrollTop;
            if(objDiv.pixelLeft>500)
            objDiv.pixelLeft = 500;
			if(objDiv.pixelTop>425)
            objDiv.pixelTop = 425;
			if(objDiv.pixelTop<0)
            objDiv.pixelTop = 0;


            return false;
        }
    }
}

//
//
//
function MouseUp() 
{
    objDiv = null;
}


//
//
//
function init()
{
    // check browser
    isMozilla = (document.all) ? 0 : 1;

  
    if (isMozilla) 
    {
      //  alert('isMozilla'+isMozilla);
      document.captureEvents(Event.MOUSEDOWN | Event.MOUSEMOVE | Event.MOUSEUP);
    }
    document.onmousedown = MouseDown;
    document.onmousemove = MouseMove;
    document.onmouseup = MouseUp;
    // add the div
    // used to dim the page
	buildDimmerDiv();

}
	
	
	function hiddenFloatingDiv(divId) 
{
	
	document.getElementById(divId).innerHTML = originalDivHTML;
	originalDivHTML="";
	objDivFrame=null;
	document.getElementById(divId).style.visibility='hidden';
	document.getElementById(divId).style.border=0;
	document.getElementById('dimmer').style.visibility = 'hidden';
	document.getElementById(iFrame).style.display = "none";
	document.getElementById(iFrame).style.width = 400 + 'px';
    document.getElementById(iFrame).style.height = 130 + 'px';
    document.getElementById(iFrame).style.left = 257 + 'px';
    document.getElementById(iFrame).style.top = 195 + 'px';


	iFrame="";
	DivID = "";
	
	
}


// call init
init();


