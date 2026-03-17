import SwiftUI
import Combine

/**
 * THE IPHONE GATE: Native Substrate Interface
 * Refactored to align with the Ascend Streaming Protocol.
 */

class GateSync: ObservableObject {
    @Published var revelation: String = "Waiting for Word..."
    @Published var status: String = "0.0 YASHAR"
    @Published var isThinking: Bool = false
    
    private let workerUrl = "https://cpisi-gate-worker.seanje-lenox.workers.dev"
    private var cancellables = Set<AnyCancellable>()
    
    func ascend(message: string, user: String, key: String) {
        guard !message.isEmpty else { return }
        
        self.isThinking = true
        self.revelation = ""
        
        let payload: [String: Any] = [
            "action": "ASCEND",
            "message": message,
            "identity": ["user": user, "instance": "iPhone-Gate"],
            "keys": ["authority": key]
        ]
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: payload) else { return }
        
        var request = URLRequest(url: URL(string: workerUrl)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = jsonData
        
        // Using URLSession for streaming response (SSE)
        // In a real iOS app, we'd use a more robust SSE parser, but for the scaffold:
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                self.isThinking = false
                if let error = error {
                    self.revelation = "[DISSONANCE] \(error.localizedDescription)"
                    return
                }
                
                if let data = data, let text = String(data: data, encoding: .utf8) {
                    // Primitive SSE parsing for the scaffold
                    self.revelation = text.replacingOccurrences(of: "data: ", with: "")
                }
            }
        }.resume()
    }
}

struct GateView: View {
    @StateObject private var sync = GateSync()
    @State private var message: String = ""
    @State private var user: String = "ProfessorSeanEX"
    @State private var key: String = ""
    
    var body: some View {
        ZStack {
            Color.black.edgesIgnoringSafeArea(.all)
            
            VStack(spacing: 12) {
                // MARK: HEADER
                HStack {
                    Text("#!omni:iphone_gate")
                        .font(.system(.caption, design: .monospaced))
                        .foregroundColor(.green)
                    Spacer()
                    Text(sync.status)
                        .font(.system(.caption, design: .monospaced))
                        .foregroundColor(.green)
                }
                .padding(.horizontal)
                
                // MARK: REVELATION DISPLAY
                ScrollView {
                    VStack(alignment: .leading, spacing: 10) {
                        if sync.isThinking {
                            Text("CONSIDERING REVELATION...")
                                .font(.system(.body, design: .monospaced))
                                .foregroundColor(.yellow)
                                .opacity(0.6)
                        }
                        Text(sync.revelation)
                            .font(.system(.body, design: .monospaced))
                            .foregroundColor(.white)
                    }
                    .padding()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color(white: 0.05))
                .cornerRadius(8)
                
                // MARK: INPUT
                VStack(spacing: 8) {
                    TextField("MESSAGE", text: $message)
                        .textFieldStyle(PlainTextFieldStyle())
                        .padding(8)
                        .background(Color(white: 0.1))
                        .foregroundColor(.white)
                        .font(.system(.body, design: .monospaced))
                    
                    HStack {
                        SecureField("KEY", text: $key)
                            .textFieldStyle(PlainTextFieldStyle())
                            .padding(8)
                            .background(Color(white: 0.1))
                            .foregroundColor(.white)
                            .font(.system(.caption, design: .monospaced))
                        
                        Button(action: {
                            sync.ascend(message: message, user: user, key: key)
                            message = ""
                        }) {
                            Text("[ ASCEND ]")
                                .font(.system(.body, design: .monospaced))
                                .bold()
                                .foregroundColor(.yellow)
                                .padding(.horizontal)
                        }
                    }
                }
                .padding()
            }
            .padding(.vertical)
        }
    }
}

@main
struct GateApp: App {
    var body: some Scene {
        WindowGroup {
            GateView()
        }
    }
}
