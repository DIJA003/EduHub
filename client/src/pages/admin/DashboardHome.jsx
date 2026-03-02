import StatsCard from "../../components/admin/StatsCard";

function DashboardHome(){
    return (
        <div>
            <h1>Dashboard OverView</h1>
            <div className="stats-gird">
                <StatsCard title="total student" value ="to get fetched"/>
                <StatsCard title="total mentors" value ="to get fetched"/>
                <StatsCard title="appeding approval" value ="to get fetched"/>
            </div>
        </div>
    )
}
export default DashboardHome;