"use strict";

var init = 1;
var cur_angle = 0;
var angle = 0;
var sun = 0;
var aclouds = 0;
var oclouds = 0;
var t_offset = 0;
var intervallId;

var o_rso_dir = 0;
var o_rso_dif = 0;
var o_rso_max = 0;
var a_rso_dir = 0;
var a_rso_dif = 0;
var a_rso_max = 0;

var API="https://apollo.open-resource.org/flight-control/metrics/graphite/series?u=grafana&p=KjLHxTnhwe12w&q=";

function popModal(target)
{
    document.getElementById(target).className = "md-modal md-effect-1 md-show";
}

function hideModal(target)
{
    document.getElementById(target).className = "md-modal md-effect-1";
}

function svgSetAtt (ele,sid,att,val)
{
    document.getElementById(ele).contentDocument.getElementById(sid).setAttributeNS(null, att, val);
}

function svgSetText (ele,sid,text)
{
    document.getElementById(ele).contentDocument.getElementById(sid).textContent=text;
}

function pad(number)
{
    if (number < 10)
    {
        return '0' + number;
    }
    return number;
}

Date.prototype.toISOString = function()
{
    return this.getUTCFullYear() +
    '-' + pad(this.getUTCMonth() + 1) +
    '-' + pad(this.getUTCDate()) +
    'T' + pad(this.getUTCHours()) +
    ':' + pad(this.getUTCMinutes()) +
    ':' + pad(this.getUTCSeconds()) +
    'Z';
};

function secToHH (seconds)
{
    var hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    return hours + ' h';
}

function setTimeOffset (position)
{
    t_offset = (86400/360)*(360-position);
    var timestamp = +new Date();
    timestamp = timestamp - t_offset;
    timestamp = new Date(timestamp);
    var v_offset = "Live";

    if (t_offset > 0)
    {
        v_offset = "-"+ secToHH(t_offset);
    }
    document.getElementById('topnav_title').innerHTML = "Apollo-NG VFCC<br /><b class='topnav_timestamp'>" + timestamp.toISOString() + " ("+v_offset+")</b>";

    updateView();
}

function jDay(year, month, day)
{
    if (year < 0) { year ++; }
    var jy = parseInt(year,10);
    var jm = parseInt(month,10) +1;
    if (month <= 2) {jy--;	jm += 12;}
    var jul = Math.floor(365.25 *jy) + Math.floor(30.6001 * jm) + parseInt(day,10) + 1720995;
    if (day+31*(month+12*year) >= (15+31*(10+12*1582))) {
        var ja = Math.floor(0.01 * jy);
        jul = jul + 2 - ja + Math.floor(0.25 * ja);
    }
    return jul;
}

function setCookie(c_name,value,exdays)
{
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name)
{
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++)
    {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if (x==c_name)
        {
            return unescape(y);
        }
    }
}

function moonPhase(year,month,day)
{
    var n = Math.floor(12.37 * (year -1900 + ((1.0 * month - 0.5)/12.0)));
    var RAD = 3.14159265/180.0;
    var t = n / 1236.85;
    var t2 = t * t;
    var as = 359.2242 + 29.105356 * n;
    var am = 306.0253 + 385.816918 * n + 0.010730 * t2;
    var xtra = 0.75933 + 1.53058868 * n + ((1.178e-4) - (1.55e-7) * t) * t2;
    xtra += (0.1734 - 3.93e-4 * t) * Math.sin(RAD * as) - 0.4068 * Math.sin(RAD * am);
    var i = (xtra > 0.0 ? Math.floor(xtra) :  Math.ceil(xtra - 1.0));
    var j1 = jDay(year,month,day);
    var jd = (2415020 + 28 * n) + i;

    var phase = (j1-jd + 30)%30;

    if (phase === 0) // New Moon
    {
        svgSetAtt("svg-energy-overlay","moonMask","d","M150,90 A60,60 10 0,1 150,210 A 60,60 10 0,1 150,90");
        svgSetAtt("svg-energy-overlay","moonMask","opacity","1");
    }

    if (phase > 0 && phase < 7) // Waning Crescent Moon
    {
        svgSetAtt("svg-energy-overlay","moonMask","d","M150,90 Q"+(230-(phase*10))+",150 150,210 A60,60 10 0,1 150,90");
        svgSetAtt("svg-energy-overlay","moonMask","opacity","1");
    }

    if (phase === 7) // First Quarter
    {
        svgSetAtt("svg-energy-overlay","moonMask","d","M150,90 L150,210 A60,60 10 0,1 150,90");
        svgSetAtt("svg-energy-overlay","moonMask","opacity","1");
    }

    if (phase > 7 && phase < 15) // Waning Gibeous Moon
    {
        svgSetAtt("svg-energy-overlay","moonMask","d","M150,90 Q"+(150-((phase-7)*10))+",150 150,210 A60,60 10 0,1 150,90");
        svgSetAtt("svg-energy-overlay","moonMask","opacity","1");
    }

    if (phase === 15) // Full Moon
    {
        svgSetAtt("svg-energy-overlay","moonMask","opacity","0");
    }

    if (phase > 15 && phase < 21) // Waxing Gibeous Moon
    {
        svgSetAtt("svg-energy-overlay","moonMask","d","M150,90 A60,60 10 0,1 150,210 Q"+(230-((phase-15)*10))+",150 150,90 ");
        svgSetAtt("svg-energy-overlay","moonMask","opacity","1");
    }

    if (phase === 21) // Last Quarter
    {
        svgSetAtt("svg-energy-overlay","moonMask","d","M150,90 A60,60 10 0,1 150,210 150,90");
        svgSetAtt("svg-energy-overlay","moonMask","opacity","1");
    }

    if (phase > 21 && phase <= 29) // Waxing Crescent Moon
    {
        svgSetAtt("svg-energy-overlay","moonMask","d","M150,90 A60,60 10 0,1 150,210 Q"+(150-((phase-21)*10))+",150 150,90 ");
        svgSetAtt("svg-energy-overlay","moonMask","opacity","1");
    }
}

function startAnim (element,offset)
{
    if(offset > 0)
    {
        document.getElementById("svg-energy-overlay").contentDocument.getElementById(element+"A").beginElementAt(offset);
        setTimeout(function () { svgSetAtt("svg-energy-overlay",element+"C","opacity","1"); }, offset*1000);
    }
    else
    {
        document.getElementById("svg-energy-overlay").contentDocument.getElementById(element+"A").beginElement();
        svgSetAtt("svg-energy-overlay",element+"C","opacity","1");
    }
}

function stopAnim (element)
{
    document.getElementById("svg-energy-overlay").contentDocument.getElementById(element+"A").endElement();
    svgSetAtt("svg-energy-overlay",element+"C","opacity","0");
}

function setSolarAnim (module,speed)
{
    if (module === "Odyssey")
    {
        svgSetAtt("svg-energy-overlay","SunRayO1CA","dur",speed);
        svgSetAtt("svg-energy-overlay","SunRayO2CA","dur",speed);
        svgSetAtt("svg-energy-overlay","SunRayO3CA","dur",speed);
        svgSetAtt("svg-energy-overlay","OPVP1CA","dur",speed);
        svgSetAtt("svg-energy-overlay","OPVP2CA","dur",speed);
        svgSetAtt("svg-energy-overlay","OPVP3CA","dur",speed);
        svgSetAtt("svg-energy-overlay","OPVP1SA","dur",speed);
        svgSetAtt("svg-energy-overlay","OPVP2SA","dur",speed);
        svgSetAtt("svg-energy-overlay","OPVP3SA","dur",speed);
        svgSetAtt("svg-energy-overlay","OSCCBatACA","dur",speed);
        svgSetAtt("svg-energy-overlay","OSCCBatBCA","dur",speed);
    }
    else
    {
        svgSetAtt("svg-energy-overlay","SunRayA1CA","dur",speed);
        svgSetAtt("svg-energy-overlay","SunRayA2CA","dur",speed);
        svgSetAtt("svg-energy-overlay","SunRayA3CA","dur",speed);
        svgSetAtt("svg-energy-overlay","SunRayA4CA","dur",speed);
        svgSetAtt("svg-energy-overlay","APVP1CA","dur",speed);
        svgSetAtt("svg-energy-overlay","APVP2CA","dur",speed);
        svgSetAtt("svg-energy-overlay","APVP3CA","dur",speed);
        svgSetAtt("svg-energy-overlay","APVP4CA","dur",speed);
        svgSetAtt("svg-energy-overlay","APVP1SA","dur",speed);
        svgSetAtt("svg-energy-overlay","APVP2SA","dur",speed);
        svgSetAtt("svg-energy-overlay","APVP3SA","dur",speed);
        svgSetAtt("svg-energy-overlay","APVP4SA","dur",speed);
        svgSetAtt("svg-energy-overlay","ASCCBatACA","dur",speed);
    }
}

function setOdysseyPanel (deg)
{
	var shift=deg/1.9;
    svgSetAtt("svg-energy-overlay","OPVP1",
              "transform","translate(0) rotate(" + deg*-1 + " 235 427)");
    svgSetAtt("svg-energy-overlay","OPVP1C",
              "d","M245," + (432-(shift/3)) +
              " L245,445 Q245,450 250,450 L390,450 Q395,450 395,455 L395,462");
    svgSetAtt("svg-energy-overlay","OPVP1CA",
              "path","M245," + (432-(shift/3)) +
              " L245,445 Q245,450 250,450 L390,450 Q395,450 395,455 L395,462");
    svgSetAtt("svg-energy-overlay","SunRayO1C","d","M170,207 L" + (256-(shift/4)) + "," + (427-(shift/2)));
    svgSetAtt("svg-energy-overlay","SunRayO1CA","path","M170,207 L" + (256-(shift/4)) + "," + (427-(shift/2)));

    svgSetAtt("svg-energy-overlay","OPVP2","transform","translate(" + shift + ") rotate(" + deg*-1 + " 275 427)");
    svgSetAtt("svg-energy-overlay","OPVP2C",
              "d","M" + (285+shift) + "," + (432-(shift/3)) +
              " L" + (285+shift) + ",442 Q" + (285+shift) + ",447 " + (290+shift) +
              ",447 L390,447 Q398,447 398,455 L398,462");
    svgSetAtt("svg-energy-overlay","OPVP2CA",
              "path","M" + (285+shift) + "," + (432-(shift/3)) +
              " L" + (285+shift) + ",442 Q" + (285+shift) + ",447 " + (290+shift) +
              ",447 L390,447 Q398,447 398,455 L398,462");
    svgSetAtt("svg-energy-overlay","SunRayO2C","d","M176,204 L" + (296+(shift*0.75)) + "," + (427-(shift/2)));
    svgSetAtt("svg-energy-overlay","SunRayO2CA","path","M176,204 L" + (296+(shift*0.75)) + "," + (427-(shift/2)));
	shift=shift*2;
    svgSetAtt("svg-energy-overlay","OPVP3","transform", "translate(" + shift + ") rotate(" + deg*-1 + " 315 427)");
    svgSetAtt("svg-energy-overlay","OPVP3C",
              "d", "M" + (326+(shift-1)) + "," + (432-(shift/6.2))
              + " L" + (326+(shift-1)) + ",439 Q" + (326+(shift-1)) + ",444 " + (331+(shift-1))
              + ",444 L390,444 Q401,444 401,455 L401,462");
    svgSetAtt("svg-energy-overlay","OPVP3CA",
              "path", "M" + (326+(shift-1)) + "," + (432-(shift/6.2))
              + " L" + (326+(shift-1)) + ",439 Q" + (326+(shift-1)) + ",444 " + (331+(shift-1))
              + ",444 L390,444 Q401,444 401,455 L401,462");
	svgSetAtt("svg-energy-overlay","SunRayO3C","d", "M182,201 L" + (335+(shift*0.9)) + "," + (427-(shift/4)));
    svgSetAtt("svg-energy-overlay","SunRayO3CA","path", "M182,201 L" + (335+(shift*0.9)) + "," + (427-(shift/4)));
}

function setAquariusPanel (deg)
{
	var shift = deg/3.1415;
    svgSetAtt("svg-energy-overlay","APVP1","transform", "translate(0) rotate(" + deg*-1 + " 85 68)");
    svgSetAtt("svg-energy-overlay","APVP1C",
    "d", "M105," + (75-(shift*1.2))
    + " L105,82 Q105,87 110,87 L180,87 Q185,87 185,92 L185,100");
    svgSetAtt("svg-energy-overlay","APVP1CA",
    "path", "M105," + (75-(shift*1.2)) + " L105,82 Q105,87 110,87 L180,87 Q185,87 185,92 L185,100");
    svgSetAtt("svg-energy-overlay","SunRayA1C","d", "M208,164 L" + (721-(shift/2.2)) + "," + (376-(shift*2.1)));
    svgSetAtt("svg-energy-overlay","SunRayA1CA","path", "M208,164 L" + (721-(shift/2.2)) + "," + (376-(shift*2.1)));

    svgSetAtt("svg-energy-overlay","APVP2","transform", "translate(" + shift*1.1 + ") rotate(" + deg*-1 + " 180 68)");
    svgSetAtt("svg-energy-overlay","APVP2C",
    "d", "M" + (202+(shift*0.9)) + "," + (75-(shift*1.2))
    + " L" + (202+(shift*0.9)) + ",80 Q" + (202+(shift*0.9)) + ",84 " + (197+(shift*0.9))
    + ",84 L197,84 Q188,84 188,95 L188,100");
    svgSetAtt("svg-energy-overlay","APVP2CA",
    "path", "M" + (202+(shift*0.9)) + "," + (75-(shift*1.2))
    + " L" + (202+(shift*0.9)) + ",80 Q" + (202+(shift*0.9)) + ",84 " + (197+(shift*0.9))
     + ",84 L197,84 Q188,84 188,95 L188,100");
    svgSetAtt("svg-energy-overlay","SunRayA2C","d", "M209,160 L" + (815+(shift/1.7)) + "," + (377-(shift*2)));
    svgSetAtt("svg-energy-overlay","SunRayA2CA","path", "M209,160 L" + (815+(shift/1.7)) + "," + (377-(shift*2)));

    svgSetAtt("svg-energy-overlay","APVP3","transform", "translate(" + shift*2.3 + ") rotate(" + deg*-1 + " 275 68)");
    svgSetAtt("svg-energy-overlay","APVP3C",
    "d", "M" + (295+(shift*2.3)) + "," + (75-(shift*1.2))
    + " L" + (295+(shift*2.3)) + ",82 Q" + (295+(shift*2.3)) + ",87 " + (290+(shift*2.3))
    + ",87 L198,87 Q191,87 191,95 L191,100");
    svgSetAtt("svg-energy-overlay","APVP3CA",
    "path", "M" + (295+(shift*2.3)) + "," + (75-(shift*1.2))
    + " L" + (295+(shift*2.3)) + ",82 Q" + (295+(shift*2.3)) + ",87 " + (290+(shift*2.3))
     + ",87 L198,87 Q191,87 191,95 L191,100");
    svgSetAtt("svg-energy-overlay","SunRayA3C","d", "M209,155 L" + (910+(shift*1.8)) + "," + (376-(shift*2)));
    svgSetAtt("svg-energy-overlay","SunRayA3CA","path", "M209,155 L" + (910+(shift*1.8)) + "," + (376-(shift*2)));

    svgSetAtt("svg-energy-overlay","APVP4","transform", "translate(" + shift*3.5 + ") rotate(" + deg*-1 + " 370 68)");
    svgSetAtt("svg-energy-overlay","APVP4C",
    "d", "M" + (390+(shift*3.5)) + "," + (75-(shift*1.2))
    + " L" + (390+(shift*3.5)) + ",85 Q" + (390+(shift*3.5)) + ",90 " + (385+(shift*3.5))
    + ",90 L199,90 Q194,90 194,95 L194,100");
    svgSetAtt("svg-energy-overlay","APVP4CA",
    "path", "M" + (390+(shift*3.5)) + "," + (75-(shift*1.2))
    + " L" + (390+(shift*3.5)) + ",85 Q" + (390+(shift*3.5)) + ",90 " + (385+(shift*3.5))
     + ",90 L199,90 Q194,90 194,95 L194,100");
    svgSetAtt("svg-energy-overlay","SunRayA4C","d", "M209,150 L" + (1005+(shift*3)) + "," + (376-(shift*2.1)));
    svgSetAtt("svg-energy-overlay","SunRayA4CA","path", "M209,150 L" + (1005+(shift*3)) + "," + (376-(shift*2.1)));
}

function movePanels ()
{
    if(cur_angle !== angle)
	{
		if   ( cur_angle < angle )
			 { cur_angle=Math.round((cur_angle+0.1)*10)/10; }
		else { cur_angle=Math.round((cur_angle-0.1)*10)/10; }

		setOdysseyPanel(cur_angle);
		setAquariusPanel(cur_angle);
        document.getElementById('OPVPA').innerHTML = cur_angle + " °";
        document.getElementById('APVPA').innerHTML = cur_angle + " °";
/*
        [].slice.call(document.getElementsByClassName( 'OPVPA' )).forEach(function (element)
        {
            element.innerHTML = cur_angle + " °";
        });
*/
        setTimeout(movePanels, 35);
    }
}

function updateSolarLive ()
{
    // Query the latest datapoints of each relevant timeseries
    // Keep this ordered, influxdb returns ascending by NAME!
    var Q   = "select+value+from+"
            + "%22aquarius.env.outdoor.pyrano%22,"
            + "%22aquarius.env.outdoor.temp%22,"
            + "%22aquarius.ucsspm.rso%22,"
            + "%22aquarius.ucsspm.sza%22,"
            + "%22odyssey.ucsspm.rso%22,"
            + "%22odyssey.ucsspm.sza%22"
            + "+where+time+<+now()+-+" + t_offset
            + "s+limit+2";

    var req = new XMLHttpRequest();
    req.open('GET', API + Q, true);

    req.onload = function()
    {
        if (req.status >= 200 && req.status < 400)
        {
            var data = JSON.parse(req.responseText);

            if (data.length === 0)
            {
                console.log("no data");
                return;
            }

            var timestamp = new Date(data[3]['points'][0][0]);
            var v_offset = "Live";

            if (t_offset > 0)
            {
                v_offset = "-"+ secToHH(t_offset);
            }

            document.getElementById('topnav_title').innerHTML = "Apollo-NG VFCC<br /><b class='topnav_timestamp'>" + timestamp.toISOString() + " ("+v_offset+")</b>";


            [].slice.call(document.getElementsByClassName( 'OPVPT' )).forEach(function (element)
            {
                element.innerHTML = data[1]['points'][0][2] + " °C";
            });

            // Global Solar Radiation (SVG + Modals)

            var new_o_rso_dif = Math.round(parseFloat(data[0]['points'][0][2])*10)/10;
            if ( new_o_rso_dif >= 100) { new_o_rso_dif = Math.round(new_o_rso_dif); }
            if ( new_o_rso_dif !== o_rso_dif)
            {
                if ( new_o_rso_dif > o_rso_dif)
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("ORDFIA1").beginElement();
                }
                else
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("ORDFDA1").beginElement();
                }

                o_rso_dif = new_o_rso_dif;
                svgSetText("svg-energy-overlay", "O-RSO-Dif", o_rso_dif);
                document.getElementById('ORSODIF').innerHTML = o_rso_dif + " W/m²";
                document.getElementById('ARSODIF').innerHTML = o_rso_dif + " W/m²";
            }

            var new_o_rso_dir = Math.round(parseFloat(data[0]['points'][1][2])*10)/10;
            if ( new_o_rso_dir >= 100) { new_o_rso_dir = Math.round(new_o_rso_dir); }
            if ( new_o_rso_dir !== o_rso_dir)
            {
                if ( new_o_rso_dir > o_rso_dir)
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("ORDIIA1").beginElement();
                }
                else
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("ORDIDA1").beginElement();
                }

                o_rso_dir = new_o_rso_dir;
                svgSetText("svg-energy-overlay", "O-RSO-Dir", o_rso_dir);
                document.getElementById('ORSODIR').innerHTML = o_rso_dir + " W/m²";
                document.getElementById('ARSODIR').innerHTML = o_rso_dir + " W/m²";

                     if (o_rso_dir > 1000) { setSolarAnim ("Odyssey","1s"); }
                else if (o_rso_dir > 500) { setSolarAnim ("Odyssey","2.5s"); }
                else if (o_rso_dir > 100) { setSolarAnim ("Odyssey","5s"); }
                else    { setSolarAnim ("Odyssey","8s"); }
            }

            var new_o_rso_max = Math.round(parseFloat(data[4]['points'][0][2])*10)/10;
            if ( new_o_rso_max >= 100) { new_o_rso_max = Math.round(new_o_rso_max); }
            if ( new_o_rso_max !== o_rso_max)
            {
                if ( new_o_rso_max > o_rso_max)
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("ORMIA1").beginElement();
                }
                else
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("ORMDA1").beginElement();
                }

                o_rso_max = new_o_rso_max;
                svgSetText("svg-energy-overlay", "O-RSO-Max", o_rso_max);
                document.getElementById('ORSOMAX').innerHTML = o_rso_max + " W/m²";
                document.getElementById('ARSOMAX').innerHTML = o_rso_max + " W/m²";
            }

            // Global Solar Radiation Indicator Arrow Animation (SVG)

            var new_a_rso_dif = Math.round(parseFloat(data[0]['points'][0][2])*10)/10;
            if ( new_a_rso_dif >= 100) { new_a_rso_dif = Math.round(new_a_rso_dif); }
            if ( new_a_rso_dif !== a_rso_dif)
            {
                if ( new_o_rso_dif > a_rso_dif)
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("ARDFIA1").beginElement();
                }
                else
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("ARDFDA1").beginElement();
                }

                a_rso_dif = new_a_rso_dif;
                svgSetText("svg-energy-overlay", "A-RSO-Dif", a_rso_dif);
            }

            var new_a_rso_dir = Math.round(parseFloat(data[0]['points'][1][2])*10)/10;
            if ( new_a_rso_dir >= 100) { new_a_rso_dir = Math.round(new_a_rso_dir); }
            if ( new_a_rso_dir !== a_rso_dir)
            {
                if ( new_a_rso_dir > a_rso_dir)
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("ARDIIA1").beginElement();
                }
                else
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("ARDIDA1").beginElement();
                }

                a_rso_dir = new_a_rso_dir;
                svgSetText("svg-energy-overlay", "A-RSO-Dir", a_rso_dir);

                if (a_rso_dir > 1000) { setSolarAnim ("Aquarius","1s"); }
                else if (a_rso_dir > 500) { setSolarAnim ("Aquarius","2.5s"); }
                else if (a_rso_dir > 100) { setSolarAnim ("Aquarius","5s"); }
                else    { setSolarAnim ("Aquarius","8s"); }
            }

            var new_a_rso_max = Math.round(parseFloat(data[2]['points'][0][2])*10)/10;
            if ( new_a_rso_max >= 100) { new_a_rso_max = Math.round(new_a_rso_max); }
            if ( new_a_rso_max !== a_rso_max)
            {
                if ( new_a_rso_max > a_rso_max)
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("ARMIA1").beginElement();
                }
                else
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("ARMDA1").beginElement();
                }

                a_rso_max = new_a_rso_max;
                svgSetText("svg-energy-overlay", "A-RSO-Max", a_rso_max);
            }

            // Electrical System output

            if (o_rso_dir > o_rso_dif)
            {
                var o_pvo = Math.round(o_rso_dir*1.825*0.2*0.98*1.01);
            }
            else
            {
                var o_pvo = Math.round(o_rso_dif*1.825*0.2*0.98*1.01);
            }

            var o_osccom = Math.round(o_pvo*0.9*10)/10;
            svgSetText("svg-energy-overlay", "OSCCText",(o_osccom > 10 ? Math.round(o_osccom) : o_osccom) );
            document.getElementById('OSCCII').innerHTML = Math.round(o_pvo/18.1*10)/10 + " A";
            document.getElementById('OSCCIP').innerHTML = o_pvo + " W";;
            document.getElementById('OSCCOMI').innerHTML = Math.round(o_pvo*0.9/14.4*10)/10 + " A";
            document.getElementById('OSCCOMP').innerHTML = (o_osccom > 100 ? Math.round(o_osccom) : o_osccom) + " W";;
            document.getElementById('OPVP1P').innerHTML = Math.round(o_pvo/3) + " W";
            document.getElementById('OPVP2P').innerHTML = Math.round(o_pvo/3.1) + " W";
            document.getElementById('OPVP3P').innerHTML = Math.round(o_pvo/2.9) + " W";


            if (o_rso_dir > o_rso_dif)
            {
                var a_pvo = Math.round(a_rso_dir*5/100*19*0.98*1.01);
            }
            else
            {
                var a_pvo = Math.round(a_rso_dif*5/100*19*0.98*1.01);
            }

            svgSetText("svg-energy-overlay", "ASCCText",a_pvo);
            document.getElementById('APVP1P').innerHTML = Math.round(a_pvo/4) + " W";
            document.getElementById('APVP2P').innerHTML = Math.round(a_pvo/4.1) + " W";
            document.getElementById('APVP3P').innerHTML = Math.round(a_pvo/4) + " W";
            document.getElementById('APVP4P').innerHTML = Math.round(a_pvo/3.9) + " W";

            // Clouds

            if (o_rso_max < o_rso_dir)
            {
                var o_clouds=0;
            }
            if ((o_rso_dir-o_rso_dif) < 10)
            {
                if(oclouds === 0)
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("OCloudShow").beginElement();
                    oclouds=1;
                }
            }
            else
            {
                if(oclouds === 1)
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("OCloudHide").beginElement();
                    oclouds=0;
                }
            }

            if ((a_rso_dir-a_rso_dif) < 10)
            {
                if(aclouds === 0)
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("ACloudShow").beginElement();
                    aclouds=1;
                }
            }
            else
            {
                if(aclouds === 1)
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("ACloudHide").beginElement();
                    aclouds=0;
                }
            }

            // Angles

            angle = Math.round(parseFloat(data[3]['points'][0][2])*10)/10;

            document.getElementById('OSZA').innerHTML = angle + " °";
            document.getElementById('ASZA').innerHTML = angle + " °";

            if (init === 1)
            {
                document.getElementById("svg-vehicle-backdrop").contentDocument.getElementById("initComplete").beginElement();
                document.getElementById("svg-vehicle-backdrop").contentDocument.getElementById("solidFadeOut").beginElement();

                setTimeout(function ()
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("OCFadeIn").beginElement();
                },1500);

                if (angle >= 90)
                {
                    moonPhase(timestamp.getUTCFullYear(),(timestamp.getUTCMonth()+1),timestamp.getUTCDate());
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("moonRise").beginElement();
                }
            }

            if (angle >= 90 && sun !== 0)
            {
                sun = 0;
                moonPhase(timestamp.getUTCFullYear(),(timestamp.getUTCMonth()+1),timestamp.getUTCDate());
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunSet").beginElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("moonRise").beginElement();
                stopAnim("SunRayO1C");
                stopAnim("SunRayO2C");
                stopAnim("SunRayO3C");
                stopAnim("SunRayA1C");
                stopAnim("SunRayA2C");
                stopAnim("SunRayA3C");
                stopAnim("SunRayA4C");
                stopAnim("OPVP1C");
                stopAnim("OPVP2C");
                stopAnim("OPVP3C");
                stopAnim("APVP1C");
                stopAnim("APVP2C");
                stopAnim("APVP3C");
                stopAnim("APVP4C");
                stopAnim("OSCCBatAC");
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OSCCBatBCA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OSCCBatBCAR").beginElement();
                stopAnim("ASCCBatAC");
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP1SA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP2SA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP3SA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP1SA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP2SA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP3SA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP4SA").endElement();
                document.getElementById('OSCCStatus').innerHTML = "Standby";
                document.getElementById('OSCCO').style.opacity = "0.4";
                document.getElementById("OSCCIS").style.display = "none";
                document.getElementById("OSCCIB").style.display = "table";
                document.getElementById("OSCCOM").className = "md-table";
                document.getElementById("OSCCOA").className = "md-table";

            }
            else if (angle < 90 && sun === 0)
            {
                sun = 1;
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRise").beginElement();
                if (init !== 1) { document.getElementById("svg-energy-overlay").contentDocument.getElementById("moonSet").beginElement(); }
                startAnim("SunRayO1C");
                startAnim("SunRayO2C",0.5);
                startAnim("SunRayO3C",1.0);
                startAnim("SunRayA1C");
                startAnim("SunRayA2C",0.5);
                startAnim("SunRayA3C",1.0);
                startAnim("SunRayA4C",1.5);
                startAnim("OPVP1C");
                startAnim("OPVP2C",0.5);
                startAnim("OPVP3C",1.0);
                startAnim("APVP1C");
                startAnim("APVP2C",0.5);
                startAnim("APVP3C",1.0);
                startAnim("APVP4C",1.5);
                startAnim("OSCCBatAC",1.0);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OSCCBatBCAR").endElement();
                startAnim("OSCCBatBC",1.0);
                startAnim("ASCCBatAC",1.5);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP1SA").beginElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP2SA").beginElementAt(0.5);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP3SA").beginElementAt(1.0);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP1SA").beginElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP2SA").beginElementAt(0.5);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP3SA").beginElementAt(1.0);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP4SA").beginElementAt(1.5);
                document.getElementById('OSCCStatus').innerHTML = "Online";
                document.getElementById('OSCCO').style.opacity = "1";
                document.getElementById("OSCCIB").style.display = "none";
                document.getElementById("OSCCIS").style.display = "table";
                document.getElementById("OSCCOM").className = "md-table t-green";
                document.getElementById("OSCCOA").className = "md-table t-white";
            }

            if (init !== 0)         { init  = 0;  }
            if (angle >= 90)        { angle = 0;  }
            else if (angle > 50)    { angle = 50; }

            if (cur_angle !== angle)
            {
                movePanels();
            }

        }
        else
        {
            console.log('data error');
        }
    };

    req.onerror = function()
    {
        console.log('connection error');
    };

    req.send();
}

function updateSolarHarvest ()
{
    if (sun === 0)
    {
        if (document.getElementById('overlay-quickstats').style.display === "block")
        {
            return;
        }
    }

    var timestamp = +new Date();

    var today  = new Date(timestamp);
    var tday   = today.getUTCFullYear() + "-" + pad(today.getUTCMonth()+1) + "-" + pad(today.getUTCDate());
    var jtday  = jDay(today.getUTCFullYear(),(today.getUTCMonth()+1),today.getUTCDate());

    var offday = new Date((timestamp-(t_offset*1000)));
    var oday   = offday.getUTCFullYear() + "-" + pad(offday.getUTCMonth()+1) + "-" + pad(offday.getUTCDate());
    var joday  = jDay(offday.getUTCFullYear(),(offday.getUTCMonth()+1),offday.getUTCDate());

    var otime  = offday.getUTCFullYear() + "-" + pad((offday.getUTCMonth()+1)) + "-" + pad(offday.getUTCDate()) + " "
               + pad(offday.getUTCHours()) + ":" + pad(offday.getUTCMinutes()) + ":" + pad(offday.getUTCSeconds());

    var Q = "select+*+from+%22aquarius.env.outdoor.pyrano%22,%22aquarius.ucsspm.out%22+where+value+>0+";

    if (jtday !== joday)
    {
        Q += "and+time+>+'" + oday + " 00:00:00'+and+time+<+'" + otime + "'";
        document.getElementById('qsday').innerHTML = "Yesterday";
    }
    else
    {
        Q += "and+time+>+'" + tday + " 00:00:00'+and+time+<+'" + otime + "'";
        document.getElementById('qsday').innerHTML = "Today";
    }

    var req = new XMLHttpRequest();
    req.open('GET', API + Q, true);

    req.onload = function()
    {
        if (req.status >= 200 && req.status < 400)
        {
            var data = JSON.parse(req.responseText);

            if( document.getElementById('overlay-quickstats').style.display !== "block" )
            {
                document.getElementById('overlay-quickstats').style.display = "block";
            }

            if (data.length === 0)
            {
                console.log("no harvest data");
                document.getElementById('OPVHT').innerHTML = "0000 Wh";
                document.getElementById('APVHT').innerHTML = "0000 Wh";
                document.getElementById('OPVUT').innerHTML = "0000 Wh";
                document.getElementById('APVUT').innerHTML = "0000 Wh";
                document.getElementById('OSolT').innerHTML = "0.0 h";
                document.getElementById('ASolT').innerHTML = "0.0 h";
                return;
            }

            var pyrano = 0;
            var p = 0;
            for( var i = 0; i < data[0]['columns'].length; i++ ){
                if (data[0]['columns'][i] === "value")
                {
                    var pc = i;
                    break;
                }
            }

            for( var i = 0; i < data[0]['columns'].length; i++ ){
                if (data[0]['columns'][i] === "type")
                {
                    var pt = i;
                    break;
                }
            }

            for( var i = 0; i < data[0]['points'].length; i++ ){
                if (data[0]['points'][i][pt] === "direct")
                {
                    pyrano += parseInt( data[0]['points'][i][pc], 10 );
                    p++;
                }
            }

            var ucsspm = 0;
            var u = 0;
            for( var i = 0; i < data[1]['columns'].length; i++ ){
                if (data[1]['columns'][i] === "value")
                {
                    var uc = i;
                    break;
                }
            }

            for( var i = 0; i < data[1]['points'].length; i++ ){
                if (data[1]['points'][i][uc] > 0)
                {
                    ucsspm += parseInt( data[1]['points'][i][uc], 10 );
                    u++;
                }
            }

            var harvesto = Math.round((pyrano/p)*(((p/360)*10)/10)*1.825*0.2);
            var harvesta = Math.round((pyrano/p)*(((p/360)*10)/10)*5*0.19);
            var ucsspmo = Math.round((ucsspm/u)*(((u/360)*10)/10)*1.825*0.2);
            var ucsspma = Math.round((ucsspm/u)*(((u/360)*10)/10)*5*0.19);

            document.getElementById('OPVHT').innerHTML = harvesto + " Wh";
            document.getElementById('APVHT').innerHTML = harvesta + " Wh";
            document.getElementById('OPVUT').innerHTML = ucsspmo + " Wh";
            document.getElementById('APVUT').innerHTML = ucsspma + " Wh";
            document.getElementById('OSolT').innerHTML = Math.round((p/360)*10)/10 + " h";
            document.getElementById('ASolT').innerHTML = Math.round((p/360)*10)/10 + " h";
        }
        else
        {
            console.log('data error');
        }
    };

    req.onerror = function()
    {
        console.log('connection error');
    };

    req.send();

}

function updateView ()
{
    if( document.getElementById('system-overview').style.display !== "block" )
    {
        document.getElementById('system-overview').style.display = "block";
    }

    updateSolarLive();
    updateSolarHarvest();
}
