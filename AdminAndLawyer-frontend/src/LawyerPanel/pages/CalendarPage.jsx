import React, { useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import useLawsuitListForLawyerStore from "../../stores/LawsuitListForLawyerStore";

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const { calendarEvents, fetchCalendarEvents, loading } =
    useLawsuitListForLawyerStore();

  useEffect(() => {
    fetchCalendarEvents(); // Takvim etkinliklerini getir
  }, [fetchCalendarEvents]);

  if (loading) return <p>Takvim verileri yükleniyor...</p>;

  // Konsola verileri logla (veri kontrolü için)
  console.log("Frontend'deki takvim eventleri:", calendarEvents);

  // Event Görünümü Özelleştirme (Stil)
  const eventPropGetter = () => ({
    style: {
      backgroundColor: "#5C8374", // Arka plan rengi
      color: "white", // Yazı rengi
      borderRadius: "5px",
      padding: "4px",
      fontSize: "12px",
    },
  });

  // Özelleştirilmiş Event Başlık Görünümü
  const customEventTitle = ({ event }) => (
    <div>
      <strong>{event.applicantName || "Ad Yok"}</strong> <br />
      Başvuru No: {event.applicationNumber || "No Yok"}
    </div>
  );

  return (
    <div className="p-6 bg-[#F1F8E9] rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Takvim</h1>
      <Calendar
        localizer={localizer}
        events={calendarEvents} // API'den gelen etkinlikler
        startAccessor="start" // Etkinlik başlangıç tarihi
        endAccessor="end" // Etkinlik bitiş tarihi
        style={{ height: "80vh" }}
        eventPropGetter={eventPropGetter} // Stil özelleştirmesi
        components={{
          event: customEventTitle, // Başlık özelleştirmesi
        }}
        onSelectEvent={(event) =>
          alert(`Başvuran: ${event.applicantName} - Başvuru No: ${event.applicationNumber}`)
        }
        messages={{
          next: "Sonraki",
          previous: "Önceki",
          today: "Bugün",
          month: "Ay",
          week: "Hafta",
          day: "Gün",
          agenda: "Ajanda",
        }}
      />
    </div>
  );
};

export default CalendarPage;
