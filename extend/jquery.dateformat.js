/**
 * Created with IntelliJ IDEA.
 * @author: 爱看书不识字<zjh527@163.com>
 */
(function($){
    $.extend({
        dateFormat: function(date, pattern){
            if (date == null) {
                return null;
            }

            if (pattern == null) {
                var formatter = "yyyy-MM-dd";
            }else{
                var formatter = pattern;
            }

            var year = date.getFullYear().toString();
            var month = (date.getMonth() + 1).toString();
            var day = date.getDate().toString();
            var hours = date.getHours().toString();
            var minutes = date.getMinutes().toString();
            var seconds = date.getSeconds().toString();
            var yearMarker = formatter.replace(/[^y]/g, '');
            var monthMarker = formatter.replace(/[^M]/g, '');
            var dayMarker = formatter.replace(/[^d]/g, '');
            var hoursMarker = formatter.replace(/[^h]/g, '');
            var minutesMarker = formatter.replace(/[^m]/g, '');
            var secondsMarker = formatter.replace(/[^s]/g, '');
            if (yearMarker.length == 2) {
                year = year.substring(2, 4);
            }

            if (monthMarker.length > 1 && month.length == 1) {
                month = "0" + month;
            }

            if (dayMarker.length > 1 && day.length == 1) {
                day = "0" + day;
            }

            if (hoursMarker.length > 1 && hours.length == 1) {
                hours = "0" + hours;
            }

            if (minutesMarker.length > 1 && minutes.length == 1) {
                minutes = "0" + minutes;
            }

            if (secondsMarker.length > 1 && seconds.length == 1) {
                seconds = "0" + seconds;
            }

            if (yearMarker.length > 0) {
                formatter = formatter.replace(yearMarker, year);
            }
            if (monthMarker.length > 0) {
                formatter = formatter.replace(monthMarker, month);
            }

            if (dayMarker.length > 0) {
                formatter = formatter.replace(dayMarker, day);
            }

            if (hoursMarker.length > 0) {
                formatter = formatter.replace(hoursMarker, hours);
            }

            if (minutesMarker.length > 0) {
                formatter = formatter.replace(minutesMarker, minutes);
            }

            if (secondsMarker.length > 0) {
                formatter = formatter.replace(secondsMarker, seconds);
            }

            return formatter;
        },
        parseDate: function(dateString, pattern){
            var today = new Date();
            if (dateString == null) {
                return today;
            }

            if (pattern == null) {
                var formatter = "yyyy-MM-dd";
            }else{
                var formatter = pattern;
            }

            var yearMarker = formatter.replace(/[^y]/g, '');
            var monthMarker = formatter.replace(/[^M]/g, '');
            var dayMarker = formatter.replace(/[^d]/g, '');
            var hoursMarker = formatter.replace(/[^h]/g, '');
            var minutesMarker = formatter.replace(/[^m]/g, '');
            var secondsMarker = formatter.replace(/[^s]/g, '');
            var yearPosition = formatter.indexOf(yearMarker);
            var yearLength = yearMarker.length;
            var year = parseInt(dateString.substring(yearPosition, yearPosition
                + yearLength));
            if (isNaN(year)) {
                year = today.getYear();
            } else {
                if (yearLength == 2) {
                    if (year < 50) {
                        year += 2000;
                    } else {
                        year += 1900;
                    }
                }
            }

            var monthPosition = formatter.indexOf(monthMarker);
            var month = parseInt(dateString.substring(monthPosition, monthPosition
                + monthMarker.length));
            if (isNaN(month)) {
                month = today.getMonth();
            } else {
                month -= 1
            }

            var dayPosition = formatter.indexOf(dayMarker);
            var day = parseInt(dateString.substring(dayPosition, dayPosition
                + dayMarker.length));
            if (isNaN(day)) {
                day = today.getDate();
            }

            var hoursPosition = formatter.indexOf(hoursMarker);
            var hours = parseInt(dateString.substring(hoursPosition, hoursPosition
                + hoursMarker.length));
            if (isNaN(hours)) {
                hours = 0;
            }

            var minutesPosition = formatter.indexOf(minutesMarker);
            var minutes = parseInt(dateString.substring(minutesPosition,
                minutesPosition + minutesMarker.length));
            if (isNaN(minutes)) {
                minutes = 0;
            }

            var secondsPosition = formatter.indexOf(secondsMarker);
            var seconds = parseInt(dateString.substring(secondsPosition,
                secondsPosition + secondsMarker.length));
            if (isNaN(seconds)) {
                seconds = 0;
            }

            return new Date(year, month, day, hours, minutes, seconds);
        }
    });
})(jQuery);
