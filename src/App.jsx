import { useState, useEffect } from "react"

import axios from "axios"

function App() {
  const [serverUrls, setServerUrls] = useState(new URLSearchParams(window.location.search));
  const [parsedServerData, setParsedServerData] = useState([]);

  function convertSeconds(seconds) {
    var days = Math.floor(seconds / (3600 * 24));
    var hours = Math.floor((seconds % (3600 * 24)) / 3600);

    let day_context;
    let hour_context;

    if (days > 1) {
      day_context = "days";
    } else {
      day_context = "day";
    }

    if (hours > 1) {
      hour_context = "hours";
    } else {
      hour_context = "hour";
    }

    return `${days} ${day_context}, ${hours} ${hour_context}`;
  }

  async function getServerData() {
    const temp_data = [];

    for (const server_info of serverUrls) {
      let server_name = server_info[0];
      let server_url = server_info[1];

      let server_request = await axios({
        method: "post",
        url: `http://${server_url}:19999/api/v1/allmetrics?format=json`, // Calling allmetrics here is def not the play because its so large
      });

      let parsed_data = {
        server_name: server_name,
        used_disk_space: server_request.data['disk_space._'].dimensions.used.value.toFixed(1),
        total_disk_space: server_request.data['disk_space._'].dimensions.avail.value.toFixed(0),
        uptime: convertSeconds(server_request.data['system.uptime'].dimensions.uptime.value),
        cpu_usage: (100 - server_request.data['system.cpu'].dimensions.idle.value).toFixed(1),
        ram_usage: (server_request.data['system.ram'].dimensions.used.value / 1000).toFixed(1)
      };

      temp_data.push(parsed_data);
    }

    setParsedServerData(temp_data);
  }


  useEffect(() => {
    getServerData()

    setInterval(getServerData, 2000);
  }, []);

  return (
    // Super bad classes but I need this like rn
    <main className="text-white">

      <div className="h-screen flex items-center justify-center">
        <div className="flex">
          {parsedServerData.map((data) => (
            <div className="bg-[#31363F] w-[20rem] m-10 rounded-xl">
              <div className="text-center pt-5">
                <p className="italic">{data.server_name}</p>
              </div>

              <div className="text-center pt-10">
                <p>CPU</p>
                <p className="text-8xl font-bold">{data.cpu_usage}</p>
                <p>%</p>
              </div>

              <div className="text-center pt-10">
                <p>RAM</p>
                <p className="text-8xl font-bold">{data.ram_usage}</p>
                <p>GiB</p>
              </div>

              <div className="text-center mt-20 pb-10">
                <p><strong>{data.used_disk_space}</strong> / <strong>{data.total_disk_space}</strong> GiB</p>
                <p><strong>{data.uptime}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </main>
  )
}

export default App
