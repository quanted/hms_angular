export class DefaultSimData {
    static defaultSimData = {
        selectedHuc: null,
        selectedCatchment: null,
        selectedComId: null,
        waiting: false,
        sim_name: null,
        simId: null,
        status: "Starting...",
        status_message: "Initializing...",
        sim_status: {
            status: "",
            message: "",
            catchments: [],
        },
        sim_executing: false,
        sim_completed: false,
        sim_rebuilding: false,
        network: {
            pour_point_comid: null,
            upstream_distance: null,
            segments: {
                pourPoint: null,
                boundary: [],
                headwater: [],
                inNetwork: [],
                totalNumSegments: null,
            },
            order: null,
            sources: null,
            network: null,
            catchment_loadings: {},
            catchment_data: {},
        },
        Location: {
            Locale: {},
            Remin: {},
        },
        json_flags: [],
        base_json: null,
        PSetup: {
            firstDay: "2000-01-01T00:00:00", // default one month
            lastDay: "2000-01-31T00:00:00", // time span
            stepSizeInDays: true,
            useFixStepSize: false,
        },
    };
}
