"use strict";

var cur_angle = 0;
var angle = 90;
var sun = 0;
var manangle = 0;

var API="https://apollo.open-resource.org/flight-control/metrics/graphite/series?u=grafana&p=KjLHxTnhwe12w&q=";


function svgSetAtt (ele,sid,att,val)
{
    document.getElementById(ele).contentDocument.getElementById(sid).setAttributeNS(null, att, val);
}

function svgSetText (ele,sid,text)
{
    document.getElementById(ele).contentDocument.getElementById(sid).textContent=text;
}

if (!Date.prototype.toISOString) {
    (function() {

        function pad(number) {
            if (number < 10) {
                return '0' + number;
            }
            return number;
        }

        Date.prototype.toISOString = function() {
            return this.getUTCFullYear() +
            '-' + pad(this.getUTCMonth() + 1) +
            '-' + pad(this.getUTCDate()) +
            'T' + pad(this.getUTCHours()) +
            ':' + pad(this.getUTCMinutes()) +
            ':' + pad(this.getUTCSeconds()) +
            '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
            'Z';
        };

    }());
}


function setOdysseyPanel (deg)
{
	var shift=deg/1.9;
    svgSetAtt("svg-energy-overlay","O-PV-Panel-1",
              "transform","translate(0) rotate(" + deg*-1 + " 235 427)");
    svgSetAtt("svg-energy-overlay","O-PV-Panel-1-Connection",
              "d","M245," + (431-(shift/4)) +
              " L245,445 Q245,450 250,450 L390,450 Q395,450 395,455 L395,462");
    svgSetAtt("svg-energy-overlay","O-PV-Panel-1-Animation",
              "path","M245," + (431-(shift/4)) +
              " L245,445 Q245,450 250,450 L390,450 Q395,450 395,455 L395,462");
    svgSetAtt("svg-energy-overlay","Sun-Ray-O-1-Connection","d","M170,207 L" + (256-(shift/4)) + "," + (427-(shift/2)));
    svgSetAtt("svg-energy-overlay","Sun-Ray-O-1-Animation","path","M170,207 L" + (256-(shift/4)) + "," + (427-(shift/2)));

    svgSetAtt("svg-energy-overlay","O-PV-Panel-2","transform","translate(" + shift + ") rotate(" + deg*-1 + " 275 427)");
    svgSetAtt("svg-energy-overlay","O-PV-Panel-2-Connection",
              "d","M" + (285+shift) + "," + (431-(shift/4)) +
              " L" + (285+shift) + ",442 Q" + (285+shift) + ",447 " + (290+shift) +
              ",447 L390,447 Q398,447 398,455 L398,462");
    svgSetAtt("svg-energy-overlay","O-PV-Panel-2-Animation",
              "path","M" + (285+shift) + "," + (431-(shift/4)) +
              " L" + (285+shift) + ",442 Q" + (285+shift) + ",447 " + (290+shift) +
              ",447 L390,447 Q398,447 398,455 L398,462");
    svgSetAtt("svg-energy-overlay","Sun-Ray-O-2-Connection","d","M176,204 L" + (296+(shift*0.75)) + "," + (427-(shift/2)));
    svgSetAtt("svg-energy-overlay","Sun-Ray-O-2-Animation","path","M176,204 L" + (296+(shift*0.75)) + "," + (427-(shift/2)));
	shift=shift*2;
    svgSetAtt("svg-energy-overlay","O-PV-Panel-3","transform", "translate(" + shift + ") rotate(" + deg*-1 + " 315 427)");
    svgSetAtt("svg-energy-overlay","O-PV-Panel-3-Connection","d", "M" + (326+(shift-1)) + "," + (431-(shift/8)) + " L" + (326+(shift-1)) + ",439 Q" + (326+(shift-1)) + ",444 " + (331+(shift-1)) + ",444 L390,444 Q401,444 401,455 L401,462");
    svgSetAtt("svg-energy-overlay","O-PV-Panel-3-Animation","path", "M" + (326+(shift-1)) + "," + (431-(shift/8)) + " L" + (326+(shift-1)) + ",439 Q" + (326+(shift-1)) + ",444 " + (331+(shift-1)) + ",444 L390,444 Q401,444 401,455 L401,462");
	svgSetAtt("svg-energy-overlay","Sun-Ray-O-3-Connection","d", "M182,201 L" + (335+(shift*0.9)) + "," + (427-(shift/4)));
    svgSetAtt("svg-energy-overlay","Sun-Ray-O-3-Animation","path", "M182,201 L" + (335+(shift*0.9)) + "," + (427-(shift/4)));
}

function setAquariusPanel (deg)
{
	var shift = deg/3.1415;
    svgSetAtt("svg-energy-overlay","A-PV-Panel-1","transform", "translate(0) rotate(" + deg*-1 + " 85 68)");
    svgSetAtt("svg-energy-overlay","A-PV-Panel-1-Connection","d", "M105," + (75-(shift*1.2)) + " L105,82 Q105,87 110,87 L180,87 Q185,87 185,92 L185,100");
    svgSetAtt("svg-energy-overlay","A-PV-Panel-1-Animation","path", "M105," + (75-(shift*1.2)) + " L105,82 Q105,87 110,87 L180,87 Q185,87 185,92 L185,100");
    svgSetAtt("svg-energy-overlay","Sun-Ray-A-1-Connection","d", "M208,164 L" + (719-(shift/2.2)) + "," + (376-(shift*2.1)));
    svgSetAtt("svg-energy-overlay","Sun-Ray-A-1-Animation","path", "M208,164 L" + (719-(shift/2.2)) + "," + (376-(shift*2.1)));

    svgSetAtt("svg-energy-overlay","A-PV-Panel-2","transform", "translate(" + shift*1.1 + ") rotate(" + deg*-1 + " 180 68)");
    svgSetAtt("svg-energy-overlay","A-PV-Panel-2-Connection","d", "M" + (202+(shift*0.9)) + "," + (75-(shift*1.2)) + " L" + (202+(shift*0.9)) + ",80 Q" + (202+(shift*0.9)) + ",84 " + (197+(shift*0.9)) + ",84 L197,84 Q188,84 188,95 L188,100");
    svgSetAtt("svg-energy-overlay","A-PV-Panel-2-Animation","path", "M" + (202+(shift*0.9)) + "," + (75-(shift*1.2)) + " L" + (202+(shift*0.9)) + ",80 Q" + (202+(shift*0.9)) + ",84 " + (197+(shift*0.9)) + ",84 L197,84 Q188,84 188,95 L188,100");
    svgSetAtt("svg-energy-overlay","Sun-Ray-A-2-Connection","d", "M209,160 L" + (815+(shift/1.7)) + "," + (376-(shift*2)));
    svgSetAtt("svg-energy-overlay","Sun-Ray-A-2-Animation","path", "M209,160 L" + (815+(shift/1.7)) + "," + (376-(shift*2)));

    svgSetAtt("svg-energy-overlay","A-PV-Panel-3","transform", "translate(" + shift*2.3 + ") rotate(" + deg*-1 + " 275 68)");
    svgSetAtt("svg-energy-overlay","A-PV-Panel-3-Connection","d", "M" + (295+(shift*2.3)) + "," + (75-(shift*1.2)) + " L" + (295+(shift*2.3)) + ",82 Q" + (295+(shift*2.3)) + ",87 " + (290+(shift*2.3)) + ",87 L198,87 Q191,87 191,95 L191,100");
    svgSetAtt("svg-energy-overlay","A-PV-Panel-3-Animation","path", "M" + (295+(shift*2.3)) + "," + (75-(shift*1.2)) + " L" + (295+(shift*2.3)) + ",82 Q" + (295+(shift*2.3)) + ",87 " + (290+(shift*2.3)) + ",87 L198,87 Q191,87 191,95 L191,100");
    svgSetAtt("svg-energy-overlay","Sun-Ray-A-3-Connection","d", "M209,155 L" + (910+(shift*1.8)) + "," + (376-(shift*2)));
    svgSetAtt("svg-energy-overlay","Sun-Ray-A-3-Animation","path", "M209,155 L" + (910+(shift*1.8)) + "," + (376-(shift*2)));

    svgSetAtt("svg-energy-overlay","A-PV-Panel-4","transform", "translate(" + shift*3.5 + ") rotate(" + deg*-1 + " 370 68)");
    svgSetAtt("svg-energy-overlay","A-PV-Panel-4-Connection","d", "M" + (390+(shift*3.5)) + "," + (75-(shift*1.2)) + " L" + (390+(shift*3.5)) + ",85 Q" + (390+(shift*3.5)) + ",90 " + (385+(shift*3.5)) + ",90 L199,90 Q194,90 194,95 L194,100");
    svgSetAtt("svg-energy-overlay","A-PV-Panel-4-Animation","path", "M" + (390+(shift*3.5)) + "," + (75-(shift*1.2)) + " L" + (390+(shift*3.5)) + ",85 Q" + (390+(shift*3.5)) + ",90 " + (385+(shift*3.5)) + ",90 L199,90 Q194,90 194,95 L194,100");
    svgSetAtt("svg-energy-overlay","Sun-Ray-A-4-Connection","d", "M209,150 L" + (1005+(shift*3)) + "," + (376-(shift*2.1)));
    svgSetAtt("svg-energy-overlay","Sun-Ray-A-4-Animation","path", "M209,150 L" + (1005+(shift*3)) + "," + (376-(shift*2.1)));
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



function updatePanels ()
{

    if(document.getElementById('system-overview').style.display === "none")
    {
        return;
    }

    //console.log("(x)");

    // Keep this ordered, influxdb returns ascending by NAME!
    var Q   = "select+value+from+"
            + "%22aquarius.env.outdoor.pyrano%22,"
            + "%22aquarius.ucsspm.rso%22,"
            + "%22aquarius.ucsspm.sza%22,"
            + "%22odyssey.ucsspm.rso%22,"
            + "%22odyssey.ucsspm.sza%22"
            + "+limit+1";

    var req = new XMLHttpRequest();
    req.open('GET', API + Q, true);

    req.onload = function()
    {
        if (req.status >= 200 && req.status < 400)
        {
            var data = JSON.parse(req.responseText);
            var timestamp = new Date(data[2]['points'][0][0]);
            document.getElementById('svg-timestamp').innerHTML = timestamp.toISOString();

            var o_rso_act = Math.round(parseFloat(data[0]['points'][0][2])*10)/10;
            if ( o_rso_act >= 100) { o_rso_act = Math.round(o_rso_act); }

            var o_rso_max = Math.round(parseFloat(data[3]['points'][0][2])*10)/10;
            if ( o_rso_max >= 100) { o_rso_max = Math.round(o_rso_max); }

            var a_rso_act = Math.round(parseFloat(data[0]['points'][0][2])*10)/10;
            if ( a_rso_act >= 100) { a_rso_act = Math.round(a_rso_act); }

            var a_rso_max = Math.round(parseFloat(data[1]['points'][0][2])*10)/10;
            if ( a_rso_max >= 100) { a_rso_max = Math.round(a_rso_max); }

            svgSetText("svg-energy-overlay", "O-RSO-Act", o_rso_act);
            svgSetText("svg-energy-overlay", "O-RSO-Max", o_rso_max);
            svgSetText("svg-energy-overlay", "O-SC-Text", Math.round(parseFloat(data[0]['points'][0][2])*1.67/100*20*0.98*1.01));
            svgSetText("svg-energy-overlay", "A-RSO-Act", a_rso_act);
            svgSetText("svg-energy-overlay", "A-RSO-Max", a_rso_max);
            svgSetText("svg-energy-overlay", "A-SC-Text", Math.round(parseFloat(data[0]['points'][0][2])*5/100*19*0.98*1.01));

            if (manangle === 0)
            {
                angle = Math.round(parseFloat(data[2]['points'][0][2])*10)/10;
            }
            else
            {
                angle=manangle;
            }

            if (angle >= 90)
            {
                angle = 0;
                //sun = 0;
            }
            else if (angle > 50)
            {
                angle = 50;
            }

            angle=35;

            if (cur_angle !== angle)
            {
                if (sun === 0 && angle > 0)
                {
                    svgSetAtt ("svg-energy-overlay","sun","opacity",1);
                    svgSetAtt ("svg-energy-overlay","moon","opacity",0);
                    sun = 1;
                }
                else if (sun === 1 && angle === 0)
                {
                    svgSetAtt ("svg-energy-overlay","sun","opacity",0);
                    svgSetAtt ("svg-energy-overlay","moon","opacity",0.35);
                    sun = 0;
                }
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

window.onload = function ()
{
    setInterval(function () {updatePanels();}, 10000);
};
