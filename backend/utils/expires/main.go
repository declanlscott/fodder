package expires

import "time"

func BeforeOpening(now time.Time) string {
	chicago, _ := time.LoadLocation("America/Chicago")
	gmt, _ := time.LoadLocation("GMT")

	chicagoTime := now.In(chicago)
	chicagoFourAm := time.Date(chicagoTime.Year(), chicagoTime.Month(), chicagoTime.Day(), 4, 0, 0, 0, chicago)

	if chicagoTime.After(chicagoFourAm) {
		chicagoFourAm = chicagoFourAm.AddDate(0, 0, 1)
	}

	return chicagoFourAm.In(gmt).Format(time.RFC1123)
}
