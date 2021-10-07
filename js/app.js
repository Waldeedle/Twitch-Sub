var giftedEvent = [];
var emitSubGifter = false;
var emitSubGiftee = false;
var timer = new easytimer.Timer();

// const socketToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbiI6IkUzMUJFNEQyQzkwNjk4MUY2RkJBIiwicmVhZF9vbmx5Ijp0cnVlLCJwcmV2ZW50X21hc3RlciI6dHJ1ZSwidHdpdGNoX2lkIjoiMTEyMTQ0NjczIn0.fNGlDBYxHiN-MP_Pro2pwI9XjJVhip-mCpHSj43IkZA';
const socketToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbiI6IkFBNDg1NEY4ODQ3MjAxQTNGNjEzIiwicmVhZF9vbmx5Ijp0cnVlLCJwcmV2ZW50X21hc3RlciI6dHJ1ZSwidHdpdGNoX2lkIjoiNzAxMDU5MSIsInlvdXR1YmVfaWQiOiJVQzIyVE9RV0p1ZTAwNkxwNkRCNVFoREEifQ.HJhum8yzd-QPMd3Xl8KeaHSIqUOfZo3j3hTOkdSDZhk';
const streamlabs = io(`https://sockets.streamlabs.com?token=${socketToken}`, {transports: ['websocket']});

streamlabs.on('event', (eventData) => {
	if (eventData.type === 'bits' || eventData.type === 'donation' || eventData.type === 'raid' 
			|| eventData.type === 'subscription' || eventData.type === 'subMysteryGift') {
		var alertData = {};
		alertData.eventType = eventData.type;
		alertData.msg = eventData.message[0].name;

		if (eventData.type === 'bits') {
			if (eventData.message[0].amount >= 100) {
				alertData.tag = eventData.message[0].amount+" bit"+((eventData.message[0].amount > 1) ? "s":"");
			} else {
				return;
			}
		}
		if (eventData.type === 'donation') {
			if (eventData.message[0].amount >= 4) {
				alertData.tag = eventData.message[0].formatted_amount;
				alertData.msg = eventData.message[0].from;
			} else {
				return;
			}
		}
		if (eventData.type === 'raid') {
			alertData.tag = "Raided x"+eventData.message[0].raiders;
		}
		if (eventData.type === 'subMysteryGift' || eventData.type === 'subGift') {
			if (giftedEvent[eventData.message[0].gifter] === undefined || eventData.type === 'subGift') {
				if (parseInt(eventData.message[0].amount) === 1) {
					emitSubGiftee = true;
				}
				giftedEvent[eventData.message[0].gifter] = eventData.message[0].amount;
				alertData.eventType = 'subgift';
				alertData.msg = eventData.message[0].gifter;
				alertData.tag = "Gifted x"+eventData.message[0].amount;
			}  else {
				return;
			}
		}
		if (eventData.type === 'subscription' || (eventData.type === 'subGift' && emitSubGiftee === true)) {
			if (giftedEvent[eventData.message[0].gifter] !== undefined && emitSubGiftee === false) {
				if (parseInt(giftedEvent[eventData.message[0].gifter]) !== 1) {
					giftedEvent[eventData.message[0].gifter]--
				} else {
					delete giftedEvent[eventData.message[0].gifter];
				}
				return;
			} else {
				var subBadges =  [1,2,3,6,9,12,18,24,30];
				for (var i = subBadges.length-1; i >= 0; i--) {
					if (eventData.message[0].months >= subBadges[i]) {
						break;
					}
				}
				alertData.eventType = 'subscription-'+subBadges[i];
				alertData.msg = eventData.message[0].name;
				alertData.tag = (i !== 0) ? "Resub x"+eventData.message[0].months : "sub";
				alertData.subBadge = subBadges[i];
				alertData.sub_plan = eventData.message[0].sub_plan;
				if (eventData.message[0].gifter !== undefined && eventData.message[0].gifter !== null && eventData.message[0].gifter !== "" && giftedEvent[eventData.message[0].gifter] === undefined) {
					emitSubGifter = true;
				}
				if (emitSubGiftee) {
					emitSubGiftee = false;
					delete giftedEvent[eventData.message[0].gifter];
				} else {
					cupTrain(1);
				}
			}
		}
		alertEvent(alertData);
		if (emitSubGifter) {
			emitSubGifter = false;
			var alertData = {};
			alertData.eventType = 'subgift';
			alertData.msg = eventData.message[0].gifter;
			alertData.tag = "Gifted x1";
			alertEvent(alertData);
		}
	}
});

const alertEvent = (alertData) => {
	$('[eventList-template]').tmpl(alertData).prependTo('.widget-EventList');
	if (alertData.eventType === "subgift") {
		var strGift = "Gifted x";
		var newSubs = parseInt(alertData.tag.substr(strGift.length));
		cupTrain(newSubs);
	}
	if (alertData.hasOwnProperty('sub_plan')) {
		if (alertData.sub_plan === "2000") {
			$('li.'+alertData.eventType+':nth-child(1) > .background').css('background','url("img/tier2.png") no-repeat, url("img/'+alertData.subBadge+'.png") no-repeat')
		} else if (alertData.sub_plan === "3000") {
			$('li.'+alertData.eventType+':nth-child(1) > .background').css('background','url("img/tier3.png") no-repeat, url("img/'+alertData.subBadge+'.png") no-repeat')
		}
	}
	animateCSS('li.'+alertData.eventType+':nth-child(1)', 'bounce');
	animateCSS('li:nth-child(n+5)', 'fadeOut');
};
const animateCSS = (element, animation) => new Promise((resolve, reject) => {
    const node = $(element);
    node.addClass('animate__animated animate__'+animation);
    function handleAnimationEnd() {
		node.removeClass('animate__animated animate__'+animation);
		node.off('animationend');
		$('li:nth-child(n+5)').remove();
    }
	node.on('animationend', handleAnimationEnd);
});
const cupTrain = (numberOfSubs) => {
	if (timer.isRunning()) {
		timer.reset();
	} else {
		timer.start({countdown: true, startValues: {seconds: 300}});
	}
	$('.widget-CupTrain-timer > .timer').html(('0'+timer.getTimeValues().minutes).substr(-2)+':'+(timer.getTimeValues().seconds+'0').substr(-2));
	var currentCount = parseInt($('.widget-CupTrain-subs > .subs').text());
	if (currentCount !== 0) {
		numberOfSubs = parseInt(numberOfSubs);
		$('.widget-CupTrain-subs > .subs').html(currentCount+numberOfSubs);
	} else {
		$('.widget-CupTrain-subs > .subs').html(numberOfSubs);
	}
	timer.addEventListener('secondsUpdated', function (e) {
		$('.widget-CupTrain-timer > .timer').html(('0'+timer.getTimeValues().minutes).substr(-2)+':'+('0'+timer.getTimeValues().seconds).substr(-2));
	});
	timer.addEventListener('targetAchieved', function (e) {
		$('.widget-CupTrain-subs > .subs').html('0');
		timer.removeEventListener('secondsUpdated');
		timer.removeEventListener('targetAchieved');
	});
};