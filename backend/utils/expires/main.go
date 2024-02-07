package expires

import "time"

func AtMidnight(now time.Time) string {
	chicago, _ := time.LoadLocation("America/Chicago")
	gmt, _ := time.LoadLocation("GMT")

	chicagoTime := now.In(chicago)
	chicagoMidnight := time.Date(chicagoTime.Year(), chicagoTime.Month(), chicagoTime.Day(), 0, 0, 0, 0, chicago)

	if chicagoTime.After(chicagoMidnight) {
		chicagoMidnight = chicagoMidnight.AddDate(0, 0, 1)
	}

	return chicagoMidnight.In(gmt).Format(time.RFC1123)
}
