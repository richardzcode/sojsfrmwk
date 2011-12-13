function frmwk_testJSFile ()
{
	alert ('JScript file framework.js works.');
}

// ***************************************
// Panel (float)
// ***************************************

var frmwk_pnl_aryPanelIds = new Array ();

function frmwk_pnl_init (sPanelId, nX, nY, bHFloat, bVFloat)
{
	// Panel
	var pnl = document.getElementById (sPanelId);
	pnl.x = nX;
	pnl.y = nY;
	pnl.bHFloat = bHFloat;
	pnl.bVFloat = bVFloat;
	pnl.nMoveStartX = 0;
	pnl.nMoveStartY = 0;
	pnl.bOnMove = false;
	pnl.childrenPanel = new Array ();
	
	pnl.absx = function ()
	{
		return document.body.scrollLeft + this.x;
	}
	
	pnl.absy = function ()
	{
		return document.body.scrollTop + this.y;
	}
	
	pnl.float = function (nScrollLeft, nScrollTop)
	{
		if (this.bHFloat)
			this.style.left = this.x + nScrollLeft;
		else
			this.style.left = this.x;
		if (this.bVFloat)
			this.style.top = this.y + nScrollTop;
		else
			this.style.top = this.y;
	}
	
	pnl.offset = function (xOffset, yOffset)
	{
		this.x += xOffset;
		this.nMoveStartX += xOffset;
		this.y += yOffset;
		this.nMoveStartY += yOffset;
		
		this.relocate ();
		
		for (var i = 0; i < this.childrenPanel.length; i ++)
		{
			this.childrenPanel[i].offset (xOffset, yOffset);
		}
	}
	
	pnl.relocate = function ()
	{
		this.float (document.body.scrollLeft, document.body.scrollTop);
	}
	
	pnl.isVisible = function ()
	{
		return (this.style.visibility != 'hidden');
	}
	
	pnl.closePanel = function ()
	{
		for (var i = 0; i < this.childrenPanel.length; i ++)
			this.childrenPanel[i].closePanel ();
		this.style.position = 'absolute';
		this.style.visibility = 'hidden';
		this.style.left = 0;
		this.style.top = 0;
	}
	
	pnl.openPanel = function ()
	{
		this.float (document.body.scrollLeft, document.body.scrollTop);
		this.style.visibility = 'visible';
	}
	
	pnl.openPanelAt = function (x, y)
	{
		this.x = x;
		this.y = y;
		this.openPanel ();
	}
	
	pnl.openAsDialog = function () // Open at the center of the window
	{
	    this.x = (document.body.clientWidth - this.clientWidth) / 2 + document.body.scrollLeft;
	    this.y = (document.body.clientHeight - this.clientHeight) / 2 + document.body.scrollTop;
	    this.openPanel ();
	}
	
	// Children
	pnl.getChildPanel = function (sChildPanelId)
	{
		for (var i = 0; i < this.childrenPanel.length; i ++)
			if (this.childrenPanel[i].id == sChildPanelId) return this.childrenPanel[i];
		return null;
	}
	
	pnl.addChildPanel = function (sChildPanelId)
	{
		var objChild = document.getElementById (sChildPanelId);
		if (objChild != null)
			this.childrenPanel.push (objChild);
	}
	
	// Done.
	var bFirstOne = (frmwk_pnl_aryPanelIds.length == 0);
	frmwk_pnl_aryPanelIds[frmwk_pnl_aryPanelIds.length] = sPanelId;
	if (bFirstOne) frmwk_pnl_timerCallback ();
	return pnl;
}

function frmwk_pnl_setMoveObject (sPanelId, sMoveObjId)
{
	if ((sPanelId == null) || (sMoveObjId == null)) return;
	
	var pnl = document.getElementById (sPanelId);
	var objMove = document.getElementById (sMoveObjId);
	if ((pnl == null) || (objMove == null)) return;
	
	objMove.targetPanel = pnl;
	objMove.onmouseup = function () {this.targetPanel.bOnMove = false;}
	objMove.onmousedown = function ()
	{
		this.targetPanel.nMoveStartX = event.clientX;
		this.targetPanel.nMoveStartY = event.clientY;
		this.targetPanel.bOnMove = true;
	}
	objMove.onmousemove = function ()
	{
		if (!this.targetPanel.bOnMove) return;
			
		var xOffset = event.clientX - this.targetPanel.nMoveStartX;
		if (this.targetPanel.x + xOffset < 0)
			xOffset = - this.targetPanel.x;
		else if ((this.targetPanel.bHFloat) && (this.targetPanel.x + xOffset > document.body.clientWidth - 8))
			xOffset = document.body.clientWidth - 8 - this.targetPanel.x;
			
		var yOffset = event.clientY - this.targetPanel.nMoveStartY;
		if (this.targetPanel.y + yOffset < 0)
			yOffset = - this.targetPanel.y;
		else if ((this.targetPanel.bVFloat) && (this.targetPanel.y + yOffset > document.body.clientHeight - 8))
			yOffset = document.body.clientHeight - 8 - this.targetPanel.y;
			
		this.targetPanel.offset (xOffset, yOffset);
		return false;
	}
}

function frmwk_pnl_setCloseObject (sPanelId, sCloseObjId)
{
	if ((sPanelId == null) || (sCloseObjId == null)) return;
	
	var pnl = document.getElementById (sPanelId);
	var objClose = document.getElementById (sCloseObjId);
	if ((pnl == null) || (objClose == null)) return;
	
	objClose.targetPanel = pnl;
	objClose.onclick = function ()
	{
		this.targetPanel.closePanel ();
		if (this.targetPanel.afterclose != null) this.targetPanel.afterclose ();	
	}
	
	objClose.afterclick= function () {}
}

function frmwk_pnl_setFloat (sPanelId, bHFloat, bVFloat)
{
	var pnl = document.getElementById (sPanelId);
	if (pnl == null) return;
	
	pnl.bHFloat = bHFloat;
	pnl.bVFloat = bVFloat;
}

function frmwk_pnl_timerCallback ()
{
	var nScrollLeft = document.body.scrollLeft;
	var nScrollTop = document.body.scrollTop;
	for (var i = 0; i < frmwk_pnl_aryPanelIds.length; i ++)
		document.getElementById (frmwk_pnl_aryPanelIds[i]).float (nScrollLeft, nScrollTop);
	
	setTimeout ('frmwk_pnl_timerCallback ()', 100);
}

function frmwk_calendar_init (sPanelId)
{
	var pnl = document.getElementById (sPanelId);
	pnl.const_Date = 0;
	pnl.const_Month = 1;
	pnl.const_Year = 2;
	pnl.const_Schedule_IDX_Id = 0;
	pnl.const_Schedule_IDX_Date = 1;
	pnl.const_Schedule_IDX_Desc = 2;
	pnl.dtCur = new Date ();
	pnl.arySchedules = new Array ();
	
	pnl.composeYMString = function (dt)
	{
		var nY = frmwk_help_getYear (dt);
		var nM = dt.getMonth () + 1; // getMonth returns 0 ~ 11
		var s = '' + nM;
		if (s.length < 2) s = '0' + s;
		return nY + '-' + s;
	}

	pnl.isDateOnSchedule = function (nD)
	{
		var nY = frmwk_help_getYear (this.dtCur);
		var nM = this.dtCur.getMonth ();
		var sDate = frmwk_help_formatDate (new Date (nY, nM, nD));
		for (var i = 0; i < this.arySchedules.length; i ++)
			if (this.arySchedules[i][this.const_Schedule_IDX_Date] == sDate) return true;

		return false;
	}
	
	pnl.drawCalendar = function ()
	{
		var nY = frmwk_help_getYear (this.dtCur);
		var nM = this.dtCur.getMonth ();
		var nD = this.dtCur.getDate ();
		var nDOfW = this.dtCur.getDay ();

		var dtDay1 = new Date (nY, nM, 1);
		var nDay1DOfW = dtDay1.getDay ();
		var dtNextMonth = new Date (nY, nM, 32);
		var nMaxDate = 32 - dtNextMonth.getDate ();

		var dtPreviousY = new Date (nY - 1, nM, 1);
		var dtPreviousM = new Date (nY, nM - 1, 1);
		var dtNextY = new Date (nY + 1, nM, 1);
		var dtNextM = new Date (nY, nM + 1, 1);

		var sCurM = this.composeYMString (this.dtCur);
		var sPreviousY = 'Previous year: ' + this.composeYMString (dtPreviousY);
		var sPreviousM = 'Previous month: ' + this.composeYMString (dtPreviousM);
		var sNextY = 'Next month: ' + this.composeYMString (dtNextY);
		var sNextM = 'Next year: ' + this.composeYMString (dtNextM);

		var sCalendar = '<table bgcolor=#ffffff border=0 cellspacing=1 cellpadding=0>'
			+ '<tr class=ftSmall><td><a href=# class=aSmall id=calendar_' + sPanelId + '_aOffsetPY title="' + sPreviousY + '">&lt;&lt;</a></td><td><a href=# class=aSmall id=calendar_' + sPanelId + '_aOffsetPM title="' + sPreviousM + '">&lt;</td>'
			+ '<td colspan=3 align=center>' + sCurM + '</td>'
			+ '<td align=right><a href=# class=aSmall id=calendar_' + sPanelId + '_aOffsetNM title="' + sNextM + '">&gt;</a></td><td align=right><a href=# class=aSmall id=calendar_' + sPanelId + '_aOffsetNY title="' + sNextY + '">&gt;&gt;</td></tr>'
			+ '<tr class=ftSmall><th bgcolor=#eeeeee width=24 align=center><font style="color: #ff0000">Sun</font></th>'
			+ '<th bgcolor=#eeeeee width=24 align=center>Mon</th>'
			+ '<th bgcolor=#eeeeee width=24 align=center>Tue</th>'
			+ '<th bgcolor=#eeeeee width=24 align=center>Wen</th>'
			+ '<th bgcolor=#eeeeee width=24 align=center>Thu</th>'
			+ '<th bgcolor=#eeeeee width=24 align=center>Fri</th>'
			+ '<th bgcolor=#eeeeee width=24 align=center>Sat</th></tr>';

		var nCur = 1 - nDay1DOfW;
		var sBgColor = '#eeeeee';
		var dtToday = new Date ();
		var nYToday = frmwk_help_getYear (dtToday);
		var nMToday = dtToday.getMonth ();
		var nDToday = dtToday.getDate ();
		var bCurrentMonth = ((nY == nYToday) && (nM == nMToday));
		for (var i = 0; i < 6; i ++)
		{
			sCalendar += '<tr class=ftSmall>';
			for (var j = 0; j < 7; j ++)
			{
				if (nCur == nD)
					sBgColor = '#dddddd';
				else
					sBgColor = '#eeeeee';
				sCalendar += '<td bgcolor=' + sBgColor + ' width=24 align=center>';
				if ((nCur > 0) && (nCur <= nMaxDate))
				{
					if (bCurrentMonth && (nCur == nDToday))
						sCalendar += '<table border=0 cellspacing=1 cellpadding=0 bgcolor=#ff0000><tr><td bgcolor=' + sBgColor + ' width=22 align=center>';
					if (this.isDateOnSchedule (nCur))
					{
						if (j == 0)
							sCalendar += '<a href=# class=aCalendarSundayBold id=calendar_' + sPanelId + '_aDate' + nCur + '>';
						else
							sCalendar += '<a href=# class=aCalendarBold id=calendar_' + sPanelId + '_aDate' + nCur + '>';
					} else
					{
						if (j == 0)
							sCalendar += '<a href=# class=aCalendarSunday id=calendar_' + sPanelId + '_aDate' + nCur + '>';
						else
							sCalendar += '<a href=# class=aCalendar id=calendar_' + sPanelId + '_aDate' + nCur + '>';
					}
					sCalendar += nCur + '</a>';
					if (bCurrentMonth && (nCur == nDToday))
						sCalendar += '</td></tr></table>';
				} else
					sCalendar += '&nbsp;';
				sCalendar += '</td>';
				nCur ++;
			}
			sCalendar += '</tr>';
		}
		sCalendar += '<tr class=ftSmall><td colspan=7></tr></table>';
		this.innerHTML = sCalendar;

		var obj = document.getElementById ('calendar_' + sPanelId + '_aOffsetPY');
		if (obj != null) obj.onclick = function ()
		{
			var pnl = document.getElementById (sPanelId);
			if (pnl != null) pnl.offsetDate (pnl.const_Year, -1);
			return false;
		}
		obj = document.getElementById ('calendar_' + sPanelId + '_aOffsetPM');
		if (obj != null) obj.onclick = function ()
		{
			var pnl = document.getElementById (sPanelId);
			if (pnl != null) pnl.offsetDate (pnl.const_Month, -1);
			return false;
		}
		obj = document.getElementById ('calendar_' + sPanelId + '_aOffsetNY');
		if (obj != null) obj.onclick = function ()
		{
			var pnl = document.getElementById (sPanelId);
			if (pnl != null) pnl.offsetDate (pnl.const_Year, 1);
			return false;
		}
		obj = document.getElementById ('calendar_' + sPanelId + '_aOffsetNM');
		if (obj != null) obj.onclick = function ()
		{
			var pnl = document.getElementById (sPanelId);
			if (pnl != null) pnl.offsetDate (pnl.const_Month, 1);
			return false;
		}

		for (var i = 0; i < 32; i ++)
		{
			obj = document.getElementById ('calendar_' + sPanelId + '_aDate' + i);
			if (obj != null)
			{
				obj.dtDate = new Date (frmwk_help_getYear (this.dtCur), this.dtCur.getMonth (), i);
				obj.onclick = function ()
				{
					var pnl = document.getElementById (sPanelId);
					if (pnl != null) pnl.onClickDate (this.dtDate); //new Date (frmwk_help_getYear (pnl.dtCur), pnl.dtCur.getMonth (), i));
					return false;
				}
			}
		}
	}
	
	pnl.offsetDate = function (nType, nOffset)
	{
		var nY = frmwk_help_getYear (this.dtCur);
		var nM = this.dtCur.getMonth ();
		var nD = this.dtCur.getDate ();
		switch (nType)
		{
		case this.const_Date:
			nD += nOffset;
			break;
		case this.const_Month:
			nM += nOffset;
			break;
		case this.const_Year:
			nY += nOffset;
			break;
		}
		var dt = new Date (nY, nM, nD);
		var nMActual = (nM + 12) % 12;
		if ((nType != this.const_Date) && (dt.getMonth () != nMActual)) // The prefered month may not have the date, for example 31 in February.
		{
			dt = new Date (nY, nM, nD - dt.getDate ());
		}
		this.setDate (dt);
	}
	
	pnl.setDate = function (dt)
	{
		this.dtCur = dt;
		this.drawCalendar ();
		this.afterDateChange (dt);
	}
	
	pnl.onClickDate = function (dt)
	{
		this.setDate (dt);
		this.drawCalendar ();
	}
	
	pnl.afterDateChange = function (dt) {}
}

function frmwk_msgbox_init (sPanelId)
{
	frmwk_pnl_init (sPanelId, 100, 100, false, false);

	var pnl = document.getElementById (sPanelId);
	pnl.const_btnOK = 0;
	pnl.const_btnCancel = 1;
	pnl.const_btnOKCancel = 2;
	pnl.const_btnYesNo = 3;
	pnl.const_resultOK = 0;
	pnl.const_resultCancel = 1;
	pnl.const_resultYes = 2;
	pnl.const_resultNo = 3;

	var sMsgBox = '<table class=dlgTable cellspacing=1 cellpadding=2>'
		+ '<tr class=dlgTableTitle>'
		+ '<th id=msgbox_' + sPanelId + '_cap width=500></th>'
		+ '<td width=12>'
		+ '<img src="images/winClose.gif" alt="Close" border=1 align=absmiddle style="cursor: hand" onclick="document.getElementById (\'' + sPanelId + '\').onResult (document.getElementById (\'' + sPanelId + '\').const_resultCancel);" />'
		+ '</td>'
		+ '</tr><tr class=dlgTableBody>'
		+ '<td id=msgbox_' + sPanelId + '_msg colspan=2></td>'
		+ '</tr><tr class=dlgTableFoot>'
		+ '<td id=msgbox_' + sPanelId + '_foot colspan=2 align=center></td>'
		+ '</tr></table>';
	pnl.innerHTML = sMsgBox;
	frmwk_pnl_setMoveObject (sPanelId, 'msgbox_' + sPanelId + '_imgMove');

	pnl.show = function (sCaption, sMsg, nbtnFlag)
	{
		document.getElementById ('msgbox_' + this.id + '_cap').innerHTML = sCaption;
		document.getElementById ('msgbox_' + this.id + '_msg').innerHTML = sMsg;
		var sFootHtml = '';
		switch (nbtnFlag)
		{
		case this.const_btnOK:
			sFootHtml = '<input type=button value=" OK " class=btnRegular onclick="document.getElementById (\'' + sPanelId + '\').onResult (' + this.const_resultOK + ');">';
			break;
		case this.const_btnCancel:
			sFootHtml = '<input type=button value="Cancel" class=btnRegular onclick="document.getElementById (\'' + sPanelId + '\').onResult (' + this.const_resultCancel + ');">';
			break;
		case this.const_btnOKCancel:
			sFootHtml = '<input type=button value=" OK " class=btnRegular onclick="document.getElementById (\'' + sPanelId + '\').onResult (' + this.const_resultOK + ');">'
				+ '&nbsp;<input type=button value="Cancel" class=btnRegular onclick="document.getElementById (\'' + sPanelId + '\').onResult (' + this.const_resultCancel + ');">';
			break;
		case this.const_btnYesNo:
			sFootHtml = '<input type=button value="Yes" class=btnRegular onclick="document.getElementById (\'' + sPanelId + '\').onResult (' + this.const_resultYes + ');">'
				+ '&nbsp;<input type=button value=" No " class=btnRegular onclick="document.getElementById (\'' + sPanelId + '\').onResult (' + this.const_resultNo + ');">';
			break;
		}
		document.getElementById ('msgbox_' + this.id + '_foot').innerHTML = sFootHtml;
		this.openAsDialog ();
	}

	pnl.onResult = function (nResult)
	{
		this.closePanel ();
		this.afterResult (nResult);
	}

	pnl.afterResult = function (nResult) {}
}

// reference: http://developer.apple.com/internet/webcontent/iframe.html
var frmwk_rpc_ifrmobj = null;
function frmwk_rpc_callToServer (sUrl)
{
	if (!document.createElement) return true;

	// Create the IFrame and assign a reference to the object to our global variable IFrameObj.
	// This will only happen the first time callToServer() is called
	if ((frmwk_rpc_ifrmobj == null) && document.createElement)
	{
		try
		{
			var tempIFrame = document.createElement ('iframe');
			tempIFrame.setAttribute ('id','frmwk_rpc_ifrm');
			tempIFrame.style.border = '0px';
			tempIFrame.style.width = '0px';
			tempIFrame.style.height = '0px';
			frmwk_rpc_ifrmobj = document.body.appendChild (tempIFrame);

			// This is for IE5 Mac, because it will only allow access to the document object of the IFrame if we access it through the document.frames array
			if (document.frames) frmwk_rpc_ifrmobj = document.frames['frmwk_rpc_ifrm'];
		} catch(exception)
		{
			// This is for IE5 PC, which does not allow dynamic creation and manipulation of an iframe object. Instead, we'll fake it up by creating our own objects.
			var ifrmHTML = '\<iframe id="frmwk_rpc_ifrm" style="border:0px; width:0px; height:0px;"><\/iframe>';
			document.body.innerHTML += ifrmHTML;
			frmwk_rpc_ifrmobj = new Object();
			frmwk_rpc_ifrmobj.document = new Object();
			frmwk_rpc_ifrmobj.document.location = new Object();
			frmwk_rpc_ifrmobj.document.location.iframe = document.getElementById('frmwk_rpc_ifrm');
			frmwk_rpc_ifrmobj.document.location.replace = function(location) { this.iframe.src = location; }
		}

		if (navigator.userAgent.indexOf('Gecko') !=-1 && !frmwk_rpc_ifrmobj.contentDocument)
		{
			// We have to give NS6 a fraction of a second to recognize the new IFrame
			setTimeout('frmwk_callToServer()',10);
			return false;
		}
	}

	var ifrmDoc;
	if (frmwk_rpc_ifrmobj.contentDocument) // For NS6
		ifrmDoc = frmwk_rpc_ifrmobj.contentDocument;
	else if (frmwk_rpc_ifrmobj.contentWindow) // For IE5.5 and IE6
		ifrmDoc = frmwk_rpc_ifrmobj.contentWindow.document;
	else if (frmwk_rpc_ifrmobj.document) // For IE5
		ifrmDoc = frmwk_rpc_ifrmobj.document;
	else
		return true;

	ifrmDoc.location.replace(sUrl);
	return false;
}

// ***************************************
// XMLHttpRequest
// Reference: http://jibbering.com/2002/4/httprequest.html
// ***************************************
function frmwk_xmlH_getRequestObject ()
{
	var xmlH;
	/*@cc_on @*/
	/*@if (@_jscript_version >= 5)
	// JScript gives us Conditional compilation, we can cope with old IE versions.
	// and security blocked creation of the objects.
		try
		{
			xmlH = new ActiveXObject('MSXML2.ServerXMLHTTP');
			xmlH.setTimeouts (10000, 10000, 10000, 10000);
			return xmlH;
			
		} catch (e1)
		{
			try
			{
				xmlH = new ActiveXObject('MSXML2.XMLHTTP');
				return xmlH;
			} catch (e2)
			{
				try
				{
					xmlH = new ActiveXObject("Microsoft.XMLHTTP");
					return xmlH;
				} catch (e3) {xmlH = null;}
			}
		}
	@end @*/
	if (typeof XMLHttpRequest!='undefined')
	{
		xmlH = new XMLHttpRequest();
		return xmlH;
	}
	return null;
}


function frmwk_xmlH_requestUrl (sMethod, sUrl)
{
	var xmlH = frmwk_xmlH_getRequestObject ();
	if (xmlH == null) return 'Create xml http object fail.';

	xmlH.open(sMethod, sUrl,false);
	xmlH.send(null);
	return xmlH.responseText;
}

function frmwk_help_getYear (dt) // Some browser, like Firefox, returns Year as offset of 1900
{
	var nY = dt.getYear ();
	if (nY < 1000) nY += 1900;
	return nY;
}

function frmwk_help_formatDate (dt)
{
	var nY = frmwk_help_getYear (dt);
	var nM = dt.getMonth () + 1;
	var nD = dt.getDate ();
	var sM = '' + nM;
	var sD = '' + nD;
	if (sM.length < 2) sM = '0' + sM;
	if (sD.length < 2) sD = '0' + sD;
	return nY + '-' + sM + '-' + sD;
}

function frmwk_help_urlEncode (s)
{
	return s;
}

function frmwk_help_htmlEncode (s)
{
	return s.replace (/&/g, '&amp;').replace (/</g, '&lt;').replace (/>/g, '&gt;').replace (/\r\n/g, '\n').replace (/\n/g, '<br>');
}

function frmwk_help_htmlAttrEncode (s)
{
	return frmwk_help_htmlEncode (s);
}

// Reference: http://en.wikipedia.org/wiki/UTF8
function frmwk_help_countChar (s)
{
	var nCount = 0;
	var charCode;
	for (var i = 0; i < s.length; i ++)
	{
		charCode = s.charCodeAt (i);
		if (charCode < 128)
			nCount ++;
		else if (charCode < 2048)
			nCount += 2;
		else if (charCode < 65536)
			nCount += 3;
		else
			nCount += 4;
	}
	return nCount;
}

function frmwk_validate_Int (n)
{
	if (n.length == 0) return false;

	var x = parseInt (n);
	if (isNaN (n)) return false;
	return true;
}

function frmwk_validate_StringLength (s, nMaxLength, objMsgBox, sInvalidCap, sInvalidMsg)
{
	var nCount = frmwk_help_countChar (s);
	if (nCount <= nMaxLength) return true;

	if (objMsgBox != null)
	{
		if (sInvalidCap == null) sInvalidCap = 'Error!';
		if (sInvalidMsg == null) sInvalidMsg = 'The string is too long.';
		objMsgBox.show (sInvalidCap, sInvalidMsg.replace ('%COUNT%', nCount) , objMsgBox.const_btnOK);
	}
	return false;
}
