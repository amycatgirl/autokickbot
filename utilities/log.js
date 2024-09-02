import c from "tinyrainbow"

class Log {
	/**
	 * @param {string} tag
	 * @param {string} output
	 */
	static d(tag, output) {
		console.log(
			c.bgCyan(c.black(tag)), output
		)
	}
	/**
	 * @param {string} tag
	 * @param {string} exception
	 */
	static e(tag, exception) {	
		console.log(
			c.bgRed(c.black(tag)), exception
		)
	}
	/**
	 * @param {string} tag
	 * @param {string} output
	 */
	static w(tag, output) {
		console.log(
			c.bgYellow(c.black(tag)), output
		)
	}
}

export { Log }
