'use strict';

const googleMaps = require('@google/maps');

const PHONE_NUMBER = 'your_phone';
const accountSid = 'your_sid';
const authToken = 'your_auth';
const smsFrom = 'MAPS';
const googleMapsApiKey = 'your_maps';

    var maps = googleMaps.createClient({
      key: googleMapsApiKey
    });
    var smsClient = require('twilio')(accountSid, authToken);

    maps.directions({
      origin: '5 Leeson Village, Donnybrook, Ireland',
      destination: 'Saint Mark\'s Community School, Fettercairn Rd, Fettercairn, Dublin 24',
      mode: 'transit',
      alternatives: true
    }, function(err, response) {
      if (err) {
        console.log(err);
      } else {
        let msg = '';
        let finalMsg = '';
        let routeNumber = 1;
        for (const route of response.json.routes) {
          for (const leg of route.legs) {
            let mins = leg.duration.value / 60;
            let hours = ~~(mins/60);
            if (hours < 10) hours = '0' + hours;
            mins = ~~(mins % 60);
            if (mins < 10) mins = '0' + mins;
            msg += hours + ':' + mins + ':\n';
            for (const step of leg.steps) {
              if (step.travel_mode == 'TRANSIT') {
                const details = step.transit_details;
                let stepInfo = details.line.short_name + ' ' + details.line.vehicle.name + ' from ' + details.departure_stop.name + ' to ' + details.arrival_stop.name + '\n';
                stepInfo = stepInfo
                  .replace(/Leeson Street Upper/gi, 'Leeson St')
                  .replace(/Waterloo Road \(Wellington Lane\)/gi, 'Waterloo Rd')
                  .replace(/Walkinstown\, Crumlin Childrens Hospital/, 'Crumlin Hosp')
                  .replace(/Tallaght\, The Square Shopping Centre/gi, 'The Square')
                  .replace(/Tallaght\, Saint Mark\'s School/gi, 'St Mark\'s')
                  .replace(/Dublin City South, /gi, '')
                  .replace(/ Luas Stop/gi, '')
                  .replace(/Outside Heuston Train Station/gi, 'Heuston')
                  .replace(/Street/gi, 'St')
                  .replace(/Tallaght\, Luas Red Cow Park and Ride/gi, 'Red Cow')
                  .replace(/Tallaght\, Cheeverstown Rd \(Cookstown Rd\)/gi, 'Cookstown Rd');

                msg += stepInfo;
              }
            }
          }
          finalMsg += msg;
          msg = '';
        }
        console.log('final msg: ' + finalMsg);
        smsClient.messages.create({
          body: finalMsg,
          to: PHONE_NUMBER,
          from: smsFrom
        });
      }
    });
