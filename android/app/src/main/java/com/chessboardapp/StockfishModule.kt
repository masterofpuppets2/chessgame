package com.yourapp

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter

class StockfishModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var stockfishProcess: Process? = null
    private var reader: BufferedReader? = null
    private var writer: OutputStreamWriter? = null

    override fun getName(): String {
        return "Stockfish"
    }

    @ReactMethod
    fun startEngine(promise: Promise) {
        try {
            // Passe den Pfad an, falls notwendig
            val process = Runtime.getRuntime().exec("/data/data/com.yourapp/files/stockfish")
            stockfishProcess = process
            reader = BufferedReader(InputStreamReader(process.inputStream))
            writer = OutputStreamWriter(process.outputStream)
            promise.resolve("Engine started")
        } catch (e: Exception) {
            promise.reject("Engine start failed", e)
        }
    }

    @ReactMethod
    fun sendCommand(command: String, promise: Promise) {
        try {
            if (writer != null) {
                writer!!.write("$command\n")
                writer!!.flush()
                promise.resolve("Command sent")
            } else {
                promise.reject("Writer is null", "Engine might not be started")
            }
        } catch (e: Exception) {
            promise.reject("Command send failed", e)
        }
    }

    @ReactMethod
    fun readOutput(promise: Promise) {
        try {
            if (reader != null) {
                val output = reader!!.readLine()
                promise.resolve(output)
            } else {
                promise.reject("Reader is null", "Engine might not be started")
            }
        } catch (e: Exception) {
            promise.reject("Read output failed", e)
        }
    }

    @ReactMethod
    fun stopEngine(promise: Promise) {
        try {
            stockfishProcess?.destroy()
            stockfishProcess = null
            reader = null
            writer = null
            promise.resolve("Engine stopped")
        } catch (e: Exception) {
            promise.reject("Engine stop failed", e)
        }
    }
}
