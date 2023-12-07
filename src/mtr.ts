import type { Eta, RouteListEntry, StopList } from "./type";
import { isSafari, getPlatformDisplay } from "./utils";

interface fetchEtasProps {
  route: RouteListEntry["route"];
  bound: RouteListEntry["bound"]["mtr"];
  stopId: string;
  stopList: StopList;
}

export default function fetchEtas({
  stopId,
  route,
  bound,
  stopList,
}: fetchEtasProps): Promise<Eta[]> {
  return fetch(
    `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${route}&sta=${stopId}`,
    {
      cache: isSafari ? "default" : "no-store",
    },
  )
    .then((response) => response.json())
    .then(({ data, status }) =>
      status === 0
        ? []
        : data[`${route}-${stopId}`][
            bound.endsWith("UT") ? "UP" : "DOWN"
          ].reduce(
            (acc: Eta[], { time, plat, dest }: any) => [
              ...acc,
              {
                eta: time.replace(" ", "T") + "+08:00",
                remark: {
                  zh: `${getPlatformDisplay(plat, "zh")}`,
                  en: `${getPlatformDisplay(plat, "en")}`,
                },
                dest: {
                  zh: stopList[dest].name.zh,
                  en: stopList[dest].name.en,
                },
                co: "mtr",
              },
            ],
            [],
          ),
    );
}