const mysql = require('mysql2/promise');

async function test() {
    const pool = mysql.createPool('mysql://avnadmin:AVNS_KigeJIVdKiHwgR_Jr9z@mysql-6557793-ayzard95-7e66.d.aivencloud.com:17687/defaultdb?ssl-mode=REQUIRED');

    try {
        const [users] = await pool.execute('SELECT id, email FROM utilisateurs');
        console.log("Users:", users);

        const [accounts] = await pool.execute('SELECT * FROM comptes_bancaires');
        console.log("Accounts in DB:", accounts);

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
test();
