"use strict";

var init = 1;
var cur_angle = 0;
var angle = 0;
var sun = 0;
var t_offset = 0;
var intervallId;

var o_rso_dir = 0;
var o_rso_dif = 0;
var o_rso_max = 0;
var a_rso_dir = 0;
var a_rso_dif = 0;
var a_rso_max = 0;

var API="https://apollo.open-resource.org/flight-control/metrics/graphite/series?u=grafana&p=KjLHxTnhwe12w&q=";


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

function setTimeOffset (position)
{
    t_offset = 600*(144-position);
    var timestamp = +new Date();
    timestamp = timestamp - t_offset;
    document.getElementById('svg-timestamp').innerHTML = timestamp;
    updateView();
}

function jDay(year, month, day)
{
    if (year < 0) { year ++; }
    var jy = parseInt(year);
    var jm = parseInt(month) +1;
    if (month <= 2) {jy--;	jm += 12;}
    var jul = Math.floor(365.25 *jy) + Math.floor(30.6001 * jm) + parseInt(day) + 1720995;
    if (day+31*(month+12*year) >= (15+31*(10+12*1582))) {
        var ja = Math.floor(0.01 * jy);
        jul = jul + 2 - ja + Math.floor(0.25 * ja);
    }
    return jul;
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
    console.log(phase);
    if (phase === 0)
    {
        return "New Moon";
    }

    if (phase > 0 && phase < 7)
    {
        return "Wanning Crescent Moon";
    }

    if (phase === 7)
    {
        return "Third Quarter";
    }

    if (phase > 7 && phase < 15)
    {
        return "Wanning Gibeous Moon";
    }

    if (phase === 15)
    {
        return "Full Moon";
    }

    if (phase > 15 && phase < 21)
    {
        return "Waxing Gibeous Moon";
    }

    if (phase === 21)
    {
        return "First Quarter";
    }

    if (phase > 21 && phase < 29)
    {
        return "Waxing Crescent Moon";
    }
}

function setOdysseyPanel (deg)
{
	var shift=deg/1.9;
    svgSetAtt("svg-energy-overlay","OPVP1",
              "transform","translate(0) rotate(" + deg*-1 + " 235 427)");
    svgSetAtt("svg-energy-overlay","OPVP1C",
              "d","M245," + (431-(shift/4)) +
              " L245,445 Q245,450 250,450 L390,450 Q395,450 395,455 L395,462");
    svgSetAtt("svg-energy-overlay","OPVP1CA",
              "path","M245," + (431-(shift/4)) +
              " L245,445 Q245,450 250,450 L390,450 Q395,450 395,455 L395,462");
    svgSetAtt("svg-energy-overlay","SunRayO1C","d","M170,207 L" + (256-(shift/4)) + "," + (427-(shift/2)));
    svgSetAtt("svg-energy-overlay","SunRayO1CA","path","M170,207 L" + (256-(shift/4)) + "," + (427-(shift/2)));

    svgSetAtt("svg-energy-overlay","OPVP2","transform","translate(" + shift + ") rotate(" + deg*-1 + " 275 427)");
    svgSetAtt("svg-energy-overlay","OPVP2C",
              "d","M" + (285+shift) + "," + (431-(shift/4)) +
              " L" + (285+shift) + ",442 Q" + (285+shift) + ",447 " + (290+shift) +
              ",447 L390,447 Q398,447 398,455 L398,462");
    svgSetAtt("svg-energy-overlay","OPVP2CA",
              "path","M" + (285+shift) + "," + (431-(shift/4)) +
              " L" + (285+shift) + ",442 Q" + (285+shift) + ",447 " + (290+shift) +
              ",447 L390,447 Q398,447 398,455 L398,462");
    svgSetAtt("svg-energy-overlay","SunRayO2C","d","M176,204 L" + (296+(shift*0.75)) + "," + (427-(shift/2)));
    svgSetAtt("svg-energy-overlay","SunRayO2CA","path","M176,204 L" + (296+(shift*0.75)) + "," + (427-(shift/2)));
	shift=shift*2;
    svgSetAtt("svg-energy-overlay","OPVP3","transform", "translate(" + shift + ") rotate(" + deg*-1 + " 315 427)");
    svgSetAtt("svg-energy-overlay","OPVP3C",
              "d", "M" + (326+(shift-1)) + "," + (431-(shift/8))
              + " L" + (326+(shift-1)) + ",439 Q" + (326+(shift-1)) + ",444 " + (331+(shift-1))
              + ",444 L390,444 Q401,444 401,455 L401,462");
    svgSetAtt("svg-energy-overlay","OPVP3CA",
              "path", "M" + (326+(shift-1)) + "," + (431-(shift/8))
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
    svgSetAtt("svg-energy-overlay","SunRayA1C","d", "M208,164 L" + (719-(shift/2.2)) + "," + (376-(shift*2.1)));
    svgSetAtt("svg-energy-overlay","SunRayA1CA","path", "M208,164 L" + (719-(shift/2.2)) + "," + (376-(shift*2.1)));

    svgSetAtt("svg-energy-overlay","APVP2","transform", "translate(" + shift*1.1 + ") rotate(" + deg*-1 + " 180 68)");
    svgSetAtt("svg-energy-overlay","APVP2C",
    "d", "M" + (202+(shift*0.9)) + "," + (75-(shift*1.2))
    + " L" + (202+(shift*0.9)) + ",80 Q" + (202+(shift*0.9)) + ",84 " + (197+(shift*0.9))
    + ",84 L197,84 Q188,84 188,95 L188,100");
    svgSetAtt("svg-energy-overlay","APVP2CA",
    "path", "M" + (202+(shift*0.9)) + "," + (75-(shift*1.2))
    + " L" + (202+(shift*0.9)) + ",80 Q" + (202+(shift*0.9)) + ",84 " + (197+(shift*0.9))
     + ",84 L197,84 Q188,84 188,95 L188,100");
    svgSetAtt("svg-energy-overlay","SunRayA2C","d", "M209,160 L" + (815+(shift/1.7)) + "," + (376-(shift*2)));
    svgSetAtt("svg-energy-overlay","SunRayA2CA","path", "M209,160 L" + (815+(shift/1.7)) + "," + (376-(shift*2)));

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
        setTimeout(movePanels, 40);
    }
}

function updateSolarLive ()
{

    //console.log("(x)");

    // Query the latest datapoints of each relevant timeseries
    // Keep this ordered, influxdb returns ascending by NAME!
    var Q   = "select+value+from+"
            + "%22aquarius.env.outdoor.pyrano%22,"
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
            //console.log(data);
            var timestamp = new Date(data[2]['points'][0][0]);
            document.getElementById('svg-timestamp').innerHTML = timestamp.toISOString();

            //console.log("Diffuse:" + data[0]['points'][0][2] + " - Direct: " + data[0]['points'][1][2]);

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
            }

            var new_o_rso_max = Math.round(parseFloat(data[3]['points'][0][2])*10)/10;
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
            }

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
            }

            var new_a_rso_max = Math.round(parseFloat(data[1]['points'][0][2])*10)/10;
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


            if (o_rso_dir > o_rso_dif)
            {
                svgSetText("svg-energy-overlay", "O-SC-Text",Math.round(o_rso_dir*1.67/100*20*0.98*1.01));
            }
            else
            {
                svgSetText("svg-energy-overlay", "O-SC-Text",Math.round(o_rso_dif*1.67/100*20*0.98*1.01));
            }

            if (o_rso_dir > o_rso_dif)
            {
                svgSetText("svg-energy-overlay", "A-SC-Text",Math.round(a_rso_dir*5/100*19*0.98*1.01));
            }
            else
            {
                svgSetText("svg-energy-overlay", "A-SC-Text",Math.round(a_rso_dif*5/100*19*0.98*1.01));
            }

            angle = Math.round(parseFloat(data[2]['points'][0][2])*10)/10;

            //console.log("Angle: "+angle+" - Current Angle: " + cur_angle + " - Sun: "+ sun);

            if (init === 1)
            {
                console.log("Init fired");
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("initComplete").beginElement();

                if (angle >= 90)
                {
                    document.getElementById("svg-energy-overlay").contentDocument.getElementById("moonRise").beginElement();
                }
            }

            if (angle >= 90 && sun !== 0)
            {
                sun = 0;
                console.log("Update Moonphase: " + moonPhase(timestamp.getUTCFullYear(),(timestamp.getUTCMonth()+1),timestamp.getUTCDate()));
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunSet").beginElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("moonRise").beginElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRayO1CA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRayO2CA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRayO3CA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP1SA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP2SA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP3SA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP1CA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP2CA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP3CA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OSCBatACA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OSCBatBCA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRayA1CA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRayA2CA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRayA3CA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRayA4CA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP1SA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP2SA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP3SA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP4SA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP1CA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP2CA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP3CA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP4CA").endElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("ASCBatACA").endElement();
            }
            else if (angle < 90 && sun === 0)
            {
                sun = 1;
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRise").beginElement();
                if (init !== 1) { document.getElementById("svg-energy-overlay").contentDocument.getElementById("moonSet").beginElement(); }
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRayO1CA").beginElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRayO2CA").beginElementAt(0.5);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRayO3CA").beginElementAt(1.0);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP1SA").beginElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP2SA").beginElementAt(0.5);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP3SA").beginElementAt(1.0);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP1CA").beginElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP2CA").beginElementAt(0.5);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OPVP3CA").beginElementAt(1.0);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OSCBatACA").beginElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("OSCBatBCA").beginElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRayA1CA").beginElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRayA2CA").beginElementAt(0.5);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRayA3CA").beginElementAt(1.0);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("SunRayA4CA").beginElementAt(1.5);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP1SA").beginElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP2SA").beginElementAt(0.5);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP3SA").beginElementAt(1.0);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP4SA").beginElementAt(1.5);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP1CA").beginElement();
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP2CA").beginElementAt(0.5);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP3CA").beginElementAt(1.0);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("APVP4CA").beginElementAt(1.5);
                document.getElementById("svg-energy-overlay").contentDocument.getElementById("ASCBatACA").beginElement();
            }

            if (init !== 0)         { init  = 0;  }
            if (angle >= 90)        { angle = 0;  }
            else if (angle > 50)    { angle = 50; }

            //console.log("Angle: "+angle+" - Current Angle: " + cur_angle + " - Sun: "+ sun);

            if (cur_angle !== angle)
            {
                //console.log("-- Angle changed");
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

    //console.log("(y)");

    var timestamp = new Date();
    var qtimestamp = timestamp.getUTCFullYear() + "-" + (timestamp.getUTCMonth()+1) + "-" + timestamp.getUTCDate();

    var Q   = "select+sum(value),count(value)+from+"
    + "%22aquarius.env.outdoor.pyrano%22+"
    + "+where+time+>+'" + qtimestamp
    + "'+and+type+=+'direct'+"
    + "+and+value+>+0";

    var req = new XMLHttpRequest();
    req.open('GET', API + Q, true);

    req.onload = function()
    {
        if (req.status >= 200 && req.status < 400)
        {
            var data = JSON.parse(req.responseText);
            //console.log(data);
            console.log("Harvest Odyssey: " + Math.round((data[0]['points'][0][1]/360)*1.67*0.2));
            console.log("Sunshine Odyssey: " + Math.round((data[0]['points'][0][2]/360)*10)/10);
            console.log("Harvest Aquarius: " + Math.round((data[0]['points'][0][1]/360)*5*0.19));
            console.log("Sunshine Aquarius: " + Math.round((data[0]['points'][0][2]/360)*10)/10);
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
    console.log("Update View");
    if( document.getElementById('system-overview').style.display !== "block" )
    {
        console.log("Display SysOverview now!!!");
        document.getElementById('system-overview').style.display = "block";
        //return;
    }

    updateSolarLive();
    updateSolarHarvest();
}
