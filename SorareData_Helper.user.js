// ==UserScript==
// @name        SorareData Helper
// @version     0.5.1
// @description Helps find the bargains on SorareData
// @license     MIT
// @author      djizus
// @include		/^(?:https?:\/\/)?(?:www\.)?soraredata.com\/publicOffers/
// @include		/^(?:https?:\/\/)?(?:www\.)?soraredata.com\/ongoingAuctions/
// @icon		https://www.google.com/s2/favicons?domain=soraredata.com
// @namespace   https://github.com/djizus
// @supportURL  https://github.com/djizus/Sorare_Helper/issues
// @grant		GM_getValue
// @grant		GM_setValue
// @grant		GM_addStyle
// @grant		GM_registerMenuCommand
// @require		https://openuserjs.org/src/libs/sizzle/GM_config.js
// @require		http://code.jquery.com/jquery-3.4.1.min.js
// @updateURL   https://github.com/djizus/Sorare_Helper/releases/latest/download/SorareData_Helper.user.js
// @downloadURL https://github.com/djizus/Sorare_Helper/releases/latest/download/SorareData_Helper.user.js
// @license		MIT
// ==/UserScript==

(function() {
    "use strict";	
	
	const windowcss = `
		#sdhCfg {
			background-color: lightblue;
		}
		#sdhCfg .reset_holder {
			float: left;
			position: relative;
			bottom: -1em;
		}
		#sdhCfg .saveclose_buttons {
			margin: .7em;
		}
		#sdhCfg_field_url {
			background: none !important;
			border: none;
			cursor: pointer;      
			padding: 0 !important;
			text-decoration: underline;
		}
		#sdhCfg_field_url:hover,
		#sdhCfg_resetLink:hover {
			filter: drop-shadow(0 0 1px dodgerblue);
		}
	`;
	const iframecss = `
		height: 26.5em;
		width: 43em;
		border: 1px solid;
		border-radius: 3px;
		position: fixed;
		z-index: 9999;
	`;

	GM_config.init({
		id: 'sdhCfg',
		title: 'SorareData Helper Configuration',
		fields:
		{
			blueBargains:
			{
				section: ['', 'Settings'],
				label: 'Activate the blue border which highlights cards listed at their very best market value',
				labelPos: 'left',
				type: 'checkbox',
				default: true,
			},
			greenBargains:
			{
				label: 'Setup the green border which highlights cards listed for % less than the market value',
				labelPos: 'left',
				type: 'select',
				options: ['5','10','15','20','25'],
				default: '10',
			},
			yellowBargains:
			{
				label: 'Setup the yellow border which highlights cards listed at their market value or less and latest 15 scores > ',
				labelPos: 'left',
				type: 'select',
				options: ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90'],
				default: '40',
			},
			global5Percentage:
			{
				label: 'Setup the starter percentage of the cards for the last 15 games',
				labelPos: 'left',
				type: 'select',
				options: ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90'],
				default: '10',
			},			
			hideCards:
			{
				label: 'Hide all cards othen than the bargains detected by this configuration',
				labelPos: 'left',
				type: 'checkbox',
				default: true,
			},	
			url:
			{
				section: ['', 'Support'],
				label: 'You can find me here on github',
				type: 'button',
				click: () => {
					GM_openInTab('https://github.com/djizus/Sorare_Helper', {
						active: true,
						insert: true,
						setParent: true
					});
				}
			},
		},
		css: windowcss,
		events:
		{
			save: function() {
				GM_config.close();
			}
		},
	});
	
	function customizeSettings() {		
		GM_config.open();
		sdhCfg.style = iframecss;
	}
	
	function addButton(text, onclick, cssObj) {
        cssObj = cssObj || {
            position: "fixed",
            bottom: "5%",
            right: "1%",
            "z-index": 3,
            fontWeight: "600",
            fontSize: "14px",
            backgroundColor: "#00cccc",
            color: "white",
            border: "none",
            padding: "10px 20px"
        };
        let button = document.createElement("button"),
            btnStyle = button.style;
        document.body.appendChild(button);
        button.innerHTML = text;
		Object.keys(cssObj).forEach(key => (btnStyle[key] = cssObj[key]));
        // Setting function for button when it is clicked.
		button.addEventListener("click", function() {
			customizeSettings();
		}, false);
        return button;
    }
    
	addButton("Settings");
			
    function quickCheckOffers() {
        $('.infinite-scroll-component > div > div').each(function(index) {

            let box = $(this);
            let infoBox = box.find('.iMQCHk');
            // get values
            let ethValues = infoBox.children("div:first")
            let ethVal = ethValues.find('div:eq(1) p').text();
			let leftValue = 0.000001;

            let num = ethVal.match(/[\d\.]+/g);
            let ethValNum = parseFloat(num[0]);

            let bestMarketPrice = ethValues.find('div[data-tip="Best market price"] p').text();
            let bestMarketPriceNum = bestMarketPrice.match(/[\d\.]+/g);
            if (bestMarketPriceNum == null) {
                bestMarketPriceNum = 0.000001;
            } else if (bestMarketPriceNum.length > 1 ){
                bestMarketPriceNum = parseFloat(bestMarketPriceNum[1]);
            } else {
				bestMarketPriceNum = parseFloat(bestMarketPriceNum[0]);
			}

            let Average3Days = ethValues.find('div[data-tip="3 days average"] p').text();
            let Average3DaysNum = Average3Days.match(/[\d\.]+/g);    
			let Average1Week = ethValues.find('div[data-tip="1 week average"] p').text();
            let Average1WeekNum = Average1Week.match(/[\d\.]+/g);
			let Average2Weeks = ethValues.find('div[data-tip="2 weeks average"] p').text();
            let Average2WeeksNum = Average2Weeks.match(/[\d\.]+/g);
            let Average1Month = ethValues.find('div[data-tip="1 month average"] p').text();
            let Average1MonthNum = Average1Month.match(/[\d\.]+/g);
            let lifetimePriceAverage = ethValues.find('div[data-tip="Card lifetime price average"] p').text();
            let lifetimePriceAverageNum = lifetimePriceAverage.match(/[\d\.]+/g);        
			
            if (Average3DaysNum == null) {
				if(Average1WeekNum == null) {
					if(Average2WeeksNum == null) {
						if(Average1MonthNum == null) {
							if(lifetimePriceAverageNum == null) {
								leftValue = parseFloat(bestMarketPriceNum[0]);
							}
							else{
								leftValue = parseFloat(lifetimePriceAverageNum[0]);
							}
						}
						else{
							leftValue = parseFloat(Average1MonthNum[0]);
						}
					}
					else {
						leftValue = parseFloat(Average2WeeksNum[0]);					
					}
				}
				else{
					leftValue = parseFloat(Average1WeekNum[0]);
				}					
            } else {
                leftValue = parseFloat(Average3DaysNum[0]);
            }

            //percent 5 games.
            let pointValues = infoBox.find('.eZKQvz');
            let percent5Game = pointValues.find("span[data-tip='% of games played over the past 5 games']").text();
            let percent5GameNum = percent5Game.match(/[\d\.]+/g);
            percent5GameNum = percent5GameNum && percent5GameNum[0]?parseInt(percent5GameNum[0]):0;
			
            //points 5 games.
            let points5Game = pointValues.find("span[data-tip='Average score over the past 5 games']").text();
            let points5GameNum = points5Game.match(/[\d\.]+/g);
            points5GameNum = points5GameNum && points5GameNum[0]?parseInt(points5GameNum[0]):0;

            //percent 15 games.
            let percent15Game = pointValues.find("span[data-tip='% of games played over the past 15 games']").text();
            let percent15GameNum = percent15Game.match(/[\d\.]+/g);
            percent15GameNum = percent15GameNum && percent15GameNum[0]?parseInt(percent15GameNum[0]):0;

            //points 15 games.
            let points15Game = pointValues.find("span[data-tip='Average score over the past 15 games']").text();
            let points15GameNum = points15Game.match(/[\d\.]+/g);
            points15GameNum = points15GameNum && points15GameNum[0]?parseInt(points15GameNum[0]):0;
			
			//GM_config.get('hideCards')
			
            if (GM_config.get('blueBargains') && ethValNum / leftValue <= 1 && percent15GameNum > GM_config.get('global5Percentage')) {
                box.css('border', '5px solid Blue');
            } else if (ethValNum / bestMarketPriceNum <= (100-GM_config.get('greenBargains')/100) && percent15GameNum >= GM_config.get('global5Percentage')) {
                box.css('border', '5px solid Lime');
            } else if (ethValNum / bestMarketPriceNum <= 1 && points15GameNum >= GM_config.get('yellowBargains') && percent15GameNum >= GM_config.get('global5Percentage')) {
                box.css('border', '5px solid Gold');
            }
            else {
                //box.css('border', '5px solid grey');
				if(GM_config.get('hideCards')){
					box.css('display', 'none');
				}                
            }
        });
    }

    setInterval(function(){
        quickCheckOffers();
    }, 500);

})();