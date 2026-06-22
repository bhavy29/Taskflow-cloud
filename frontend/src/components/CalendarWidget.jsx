const CalendarWidget = () => {
    return (
        <section className="dashboard-card calendar-widget-card">
            <div className="dashboard-card-header">
                <h3>Upcoming calendar</h3>
                <span>Next 7 days</span>
            </div>

            <div className="calendar-list">
                <div className="calendar-day">
                    <strong>Mon</strong>
                    <span>Team review</span>
                </div>
                <div className="calendar-day">
                    <strong>Tue</strong>
                    <span>Client meeting</span>
                </div>
                <div className="calendar-day">
                    <strong>Wed</strong>
                    <span>Release prep</span>
                </div>
            </div>
        </section>
    );
};

export default CalendarWidget;
