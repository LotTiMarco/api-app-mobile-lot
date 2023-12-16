export default {
    application: {
        cors: {
            server: [
                {
                    origin: '*',
                    credentials: true,
                },
            ],
        },
    },
};
