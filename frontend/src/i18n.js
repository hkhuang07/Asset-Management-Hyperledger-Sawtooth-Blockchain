import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        dashboard: 'Dashboard',
        assets: 'Asset Manager',
        explorer: 'Explorer',
        performance: 'Performance',
        keymgmt: 'Key Management',
        architecture: 'Architecture',
        families: 'Sample Families',
        crypto: 'Cryptography',
        settings: 'Settings',
        logout: 'Logout',
        system_status: 'System Status',
        nodes_synced: 'Nodes Synced',
        online: 'Online',
        offline: 'Offline'
      },
      dashboard: {
        title: 'Network Overview',
        stats_title: 'Network Overview',
        total_blocks: 'Total Blocks',
        total_txs: 'Total Transactions',
        active_nodes: 'Active Nodes',
        activity: 'Blockchain Activity',
        sync_check: 'Compare State (Sync Check)',
        syncing: 'Checking...',
        sync_match: 'Sync Match! All nodes have the same state root.',
        chain_id: 'Chain ID',
        network_latency: 'Network Latency',
        registered_assets: 'Registered Assets',
        block_height: 'Block Height',
        network_load: 'Network Load',
        tx_velocity: 'Transaction Velocity',
        processing_volume: 'Processing volume across recent blocks',
        live_feed: 'Live Feed',
        recent_events: 'Recent Events',
        protocol_monitor: 'Protocol Monitor',
        devmode_desc: 'Devmode Consensus is active. The network is operating with 1 validator node. All data is decentralized and shared correctly.',
        core_system: 'Core System',
        validator_consensus: 'Validator & Consensus (Rust)',
        core_desc: 'Handles network P2P, state database, and block consensus',
        app_domain: 'App Domain (Modular TPs)'
      },
      assets: {
        title: 'Asset Manager',
        create_asset: 'Create New Asset',
        asset_name: 'Asset Name',
        asset_value: 'Asset Value',
        submit: 'Submit Transaction',
        list_title: 'Registered Assets',
        no_assets: 'No assets found. Create your first asset!',
        id: 'Asset ID',
        owner: 'Owner',
        timestamp: 'Timestamp',
        transfer: 'Transfer',
        transfer_to: 'Transfer to',
        my_asset: 'My Asset',
        confirm_transfer: 'Confirm Transfer',
        cancel: 'Cancel',
        select_recipient: 'Select Recipient'
      },
      explorer: {
        title: 'Blockchain Explorer',
        latest_blocks: 'Latest Blocks',
        block_height: 'Block #',
        tx_count: 'Transactions',
        view_details: 'View Details',
        block_details: 'Block Details',
        hash: 'Hash',
        prev_hash: 'Previous Hash',
        state_root: 'State Root'
      },
      events: {
        title: 'Real-time Event Stream',
        connected: 'Connected to Sawtooth Event System',
        waiting: 'Waiting for new events...'
      },
      performance: {
        title: 'Performance Testing',
        subtitle: 'Stress-test the Sawtooth network throughput and latency',
        config: 'Test Configuration',
        total_batches: 'Total Batches',
        batch_size: 'Batch Size',
        scheduling_mode: 'Scheduling Mode',
        parallel: 'Parallel (Different State Addresses)',
        sequential: 'Sequential (Same State Address)',
        feature_note: 'Sawtooth Feature: When transactions target different state addresses, the Parallel Scheduler executes them concurrently.',
        run_test: 'Run Load Test',
        running: 'Running Suite...',
        tx_per_sec: 'TPS (Transactions Per Second)',
        latency: 'Average Latency',
        status: 'Status',
        recent_results: 'Recent Test Results',
        success: 'Success',
        no_data: 'No test data available in current session',
        pushing_tx: 'Pushing Transactions to Validator-0...',
        collecting: 'Collecting telemetry data',
        total_tx: 'Total Tx',
        success_rate: 'Success Rate',
        total_duration: 'Total Duration'
      },
      keymgmt: {
        title: 'Key Management',
        subtitle: 'Cryptographic identity on the Sawtooth Network',
        active_identity: 'Active Identity',
        public_key: 'Public Key (Public Address)',
        private_key: 'Private Key (Secret)',
        rotate: 'Rotate Identity',
        reset: 'Reset Keys',
        security_note: 'Security Note',
        security_note_desc: "Your private key is your access to the blockchain. NEVER share it. For this demo, keys are stored in your browser's local storage.",
        encryption: 'Encryption',
        storage: 'Storage',
        browser_enclave: 'Browser Enclave',
        network_status: 'Network Status',
        network_status_desc: 'Connected to local Sawtooth Validator via REST API Proxy.',
        socket_online: 'Socket Online',
        view_docs: 'View SDK Documentation',
        identity_registry: 'Identity Registry',
        nodes_registered: 'Nodes Registered',
        table_user: 'User',
        table_role: 'Role',
        table_address: 'Public Key (Address ID)',
        table_status: 'Status',
        status_active: 'Active',
        status_secure: 'Secure'
      },
      architecture: {
        title: 'Sawtooth Architecture',
        subtitle: 'Separation of Core System from Application Domain',
        desc: 'Hyperledger Sawtooth is designed with a core philosophy: Keep the distributed ledger separate from the smart contract logic. This modularity allows enterprises to build secure, language-agnostic applications without risking the core consensus network.',
        app_domain: 'Application Domain',
        app_domain_desc: 'Contains business logic (Smart Contracts / Transaction Processors) written in any language (Python, Rust, Go, JS).',
        zmq_comm: 'ZeroMQ (ZMQ)<br/>Communication',
        core_system: 'Core System',
        core_system_desc: 'Handles networking, block building, state management, and consensus. It is completely agnostic to business rules.',
        validator_node: 'Validator Node',
        global_state: 'Global State (Radix Merkle Tree)',
        consensus: 'Consensus (Devmode/PBFT)',
        high_modularity: 'High Modularity',
        high_modularity_desc: 'Because the Application Domain communicates with the Core via ZMQ, you can hot-swap Transaction Processors without taking down the blockchain network.',
        secure_smart_contracts: 'Secure Enterprise Smart Contracts',
        secure_smart_contracts_desc: 'Unlike Ethereum where any user can deploy any code, Sawtooth requires Transaction Processors to be run by node operators, ensuring only approved enterprise logic executes.'
      },
      sample_families: {
        title: 'Sample Transaction Families',
        subtitle: 'Core transaction models provided by Hyperledger Sawtooth',
        desc: 'Because developers build custom transaction families (like our Asset TP) for their specific ledger requirements, Sawtooth provides several core transaction families as models and for low-level network operations.',
        purpose: 'Purpose',
        use_case: 'Use Case',
        custom: 'Custom',
        asset_tp_desc: 'The custom transaction processor deployed in this application. It handles logic for creating and transferring digital assets, proving how application logic is entirely abstracted from the core consensus engine.',
        list: {
          settings: {
            desc: 'Provides a reference implementation for storing on-chain configuration settings.',
            use_case: 'Setting consensus algorithms, authorization rules, and max batch sizes across the network.'
          },
          identity: {
            desc: 'Handles on-chain permissioning for transactors and validating keys.',
            use_case: 'Streamlining identity management and public key lists for enterprise private networks.'
          },
          intkey: {
            desc: 'Used for testing deployed ledgers by setting and modifying simple integer values.',
            use_case: "Basic 'Hello World' style health checks and simple counter applications."
          },
          smallbank: {
            desc: 'Handles performance analysis for benchmarking and performance testing.',
            use_case: 'Based on the H-Store Smallbank benchmark to compare blockchain system performance.'
          },
          blockinfo: {
            desc: 'Provides a methodology for storing information about historic blocks.',
            use_case: 'Smart contracts that need to reference timestamps or state hashes from previous blocks.'
          }
        }
      },
      crypto: {
        title: 'Security & Cryptography Demo',
        subtitle: 'Understand the cryptographic primitives powering Hyperledger Sawtooth.',
        hashing_title: '1. Data Hashing (SHA-512)',
        hashing_desc: 'Hashing is a one-way function that maps data of any size to a fixed-size string. Try changing just one letter below and observe how the entire hash changes (Avalanche Effect).',
        input_data: 'Input Data',
        resulting_hash: 'Resulting Hash (SHA-512)',
        signing_title: '2. Sign Transaction',
        signing_desc: 'In Sawtooth, transactions are signed by the sender\'s Private Key using secp256k1. This proves the sender authorized the exact payload.',
        tx_payload: 'Transaction Payload',
        signing_with: 'Signing with Private Key',
        gen_sig: 'Generate Signature',
        sig_label: 'Cryptographic Signature',
        verify_title: '3. Network Verification (Validator Simulation)',
        verify_desc: 'When a transaction arrives at a validator, the network checks the signature against the payload and the sender\'s Public Key. Try changing just one character in the Payload or Signature below, then click Verify!',
        received_payload: 'Received Payload',
        received_sig: 'Received Signature',
        verifying_with: 'Verifying with Public Key',
        verify_btn: 'Verify Integrity',
        valid_tx: 'Valid Transaction',
        invalid_tx: 'Tampered Data Rejected'
      }
    }
  },
  vi: {
    translation: {
      nav: {
        dashboard: 'Tổng quan',
        assets: 'Quản lý tài sản',
        explorer: 'Trình khám phá',
        performance: 'Hiệu suất',
        keymgmt: 'Quản lý khóa (Keys)',
        architecture: 'Kiến trúc mạng',
        families: 'Mẫu Smart Contract',
        crypto: 'Mật mã học',
        settings: 'Cài đặt',
        logout: 'Đăng xuất',
        system_status: 'Trạng thái Hệ thống',
        nodes_synced: 'Các Nút đã Đồng bộ',
        online: 'Trực tuyến',
        offline: 'Ngoại tuyến'
      },
      dashboard: {
        title: 'Tổng quan mạng lưới',
        stats_title: 'Tổng quan mạng lưới',
        total_blocks: 'Tổng số khối',
        total_txs: 'Tổng giao dịch',
        active_nodes: 'Nút mạng hoạt động',
        activity: 'Hoạt động Blockchain',
        sync_check: 'Kiểm tra đồng bộ (Sync Check)',
        syncing: 'Đang kiểm tra...',
        sync_match: 'Đồng bộ chính xác! Tất cả các nút có cùng gốc trạng thái.',
        chain_id: 'Mã chuỗi',
        network_latency: 'Độ trễ mạng',
        registered_assets: 'Tài sản đã đăng ký',
        block_height: 'Độ cao khối',
        network_load: 'Tải mạng lưới',
        tx_velocity: 'Vận tốc giao dịch',
        processing_volume: 'Khối lượng xử lý trên các khối gần đây',
        live_feed: 'Luồng trực tiếp',
        recent_events: 'Sự kiện gần đây',
        protocol_monitor: 'Giám sát Giao thức',
        devmode_desc: 'Đồng thuận Devmode đang hoạt động. Mạng lưới đang vận hành với 1 nút xác thực. Toàn bộ dữ liệu được phân tán và chia sẻ chính xác.',
        core_system: 'Hệ thống cốt lõi',
        validator_consensus: 'Xác thực & Đồng thuận (Rust)',
        core_desc: 'Xử lý P2P, cơ sở dữ liệu trạng thái và đồng thuận',
        app_domain: 'Miền ứng dụng (Modular TPs)'
      },
      assets: {
        title: 'Quản lý tài sản',
        create_asset: 'Tạo tài sản mới',
        asset_name: 'Tên tài sản',
        asset_value: 'Giá trị tài sản',
        submit: 'Gửi giao dịch',
        list_title: 'Tài sản đã đăng ký',
        no_assets: 'Không tìm thấy tài sản nào. Hãy tạo tài sản đầu tiên của bạn!',
        id: 'Mã tài sản',
        owner: 'Người sở hữu',
        timestamp: 'Thời gian',
        transfer: 'Chuyển nhượng',
        transfer_to: 'Chuyển tới',
        my_asset: 'Tài sản của tôi',
        confirm_transfer: 'Xác nhận Chuyển',
        cancel: 'Hủy',
        select_recipient: 'Chọn người nhận'
      },
      explorer: {
        title: 'Trình khám phá Blockchain',
        latest_blocks: 'Khối mới nhất',
        block_height: 'Khối số',
        tx_count: 'Số giao dịch',
        view_details: 'Xem chi tiết',
        block_details: 'Chi tiết khối',
        hash: 'Mã Hash',
        prev_hash: 'Hash trước đó',
        state_root: 'Gốc trạng thái'
      },
      events: {
        title: 'Luồng sự kiện thời gian thực',
        connected: 'Đã kết nối với hệ thống sự kiện Sawtooth',
        waiting: 'Đang chờ sự kiện mới...'
      },
      performance: {
        title: 'Kiểm tra Hiệu suất',
        subtitle: 'Kiểm tra tải lưu lượng và độ trễ của mạng lưới Sawtooth',
        config: 'Cấu hình Kiểm tra',
        total_batches: 'Tổng số Batch',
        batch_size: 'Kích thước Batch',
        scheduling_mode: 'Chế độ Lập lịch',
        parallel: 'Song song (Khác địa chỉ trạng thái)',
        sequential: 'Tuần tự (Cùng địa chỉ trạng thái)',
        feature_note: 'Tính năng Sawtooth: Khi các giao dịch hướng đến các địa chỉ khác nhau, bộ lập lịch Song song sẽ thực thi chúng cùng lúc.',
        run_test: 'Chạy thử tải',
        running: 'Đang chạy...',
        tx_per_sec: 'TPS (Giao dịch mỗi giây)',
        latency: 'Độ trễ trung bình',
        status: 'Trạng thái',
        recent_results: 'Kết quả Kiểm tra Gần đây',
        success: 'Thành công',
        no_data: 'Chưa có dữ liệu kiểm tra',
        pushing_tx: 'Đang đẩy giao dịch tới Validator-0...',
        collecting: 'Đang thu thập dữ liệu',
        total_tx: 'Tổng Giao dịch',
        success_rate: 'Tỷ lệ Thành công',
        total_duration: 'Tổng thời gian'
      },
      keymgmt: {
        title: 'Quản lý khóa (Keys)',
        subtitle: 'Định danh mật mã trên Mạng lưới Sawtooth',
        active_identity: 'Định danh hiện tại',
        public_key: 'Khóa công khai (Địa chỉ mạng)',
        private_key: 'Khóa bí mật (Riêng tư)',
        rotate: 'Đổi Khóa mới',
        reset: 'Xóa Khóa',
        security_note: 'Lưu ý Bảo mật',
        security_note_desc: "Khóa riêng tư của bạn là quyền truy cập vào blockchain. KHÔNG BAO GIỜ chia sẻ nó. Ở bản demo này, khóa được lưu trong trình duyệt.",
        encryption: 'Thuật toán mã hóa',
        storage: 'Lưu trữ',
        browser_enclave: 'Bộ nhớ Trình duyệt',
        network_status: 'Trạng thái Mạng',
        network_status_desc: 'Đã kết nối với Validator nội bộ qua REST API Proxy.',
        socket_online: 'Socket Trực tuyến',
        view_docs: 'Xem tài liệu SDK',
        identity_registry: 'Danh mục Định danh',
        nodes_registered: 'Nút mạng đã đăng ký',
        table_user: 'Người dùng',
        table_role: 'Vai trò',
        table_address: 'Khóa Công khai (Địa chỉ ID)',
        table_status: 'Trạng thái',
        status_active: 'Hoạt động',
        status_secure: 'Bảo mật'
      },
      architecture: {
        title: 'Kiến trúc mạng',
        subtitle: 'Phân tách giữa Hệ thống cốt lõi và Miền ứng dụng',
        desc: 'Hyperledger Sawtooth được thiết kế với triết lý cốt lõi: Tách biệt sổ cái phân tán khỏi logic hợp đồng thông minh. Điều này cho phép doanh nghiệp xây dựng ứng dụng bảo mật mà không rủi ro cho mạng lưới.',
        app_domain: 'Miền ứng dụng',
        app_domain_desc: 'Chứa logic nghiệp vụ (Smart Contracts/Transaction Processors) viết bằng bất kỳ ngôn ngữ nào (Python, Rust, Go, JS).',
        zmq_comm: 'Giao tiếp<br/>ZeroMQ (ZMQ)',
        core_system: 'Hệ thống cốt lõi',
        core_system_desc: 'Xử lý mạng lưới, tạo khối, quản lý trạng thái và đồng thuận. Hoàn toàn độc lập với các quy tắc nghiệp vụ.',
        validator_node: 'Nút xác thực (Validator)',
        global_state: 'Trạng thái toàn cục (Cây Merkle Radix)',
        consensus: 'Đồng thuận (Devmode/PBFT)',
        high_modularity: 'Tính Module hóa cao',
        high_modularity_desc: 'Vì Miền ứng dụng giao tiếp với Core qua ZMQ, bạn có thể thay thế các Transaction Processor mà không cần khởi động lại mạng blockchain.',
        secure_smart_contracts: 'Hợp đồng thông minh bảo mật',
        secure_smart_contracts_desc: 'Không giống như Ethereum nơi bất kỳ ai cũng có thể triển khai mã nguồn, Sawtooth yêu cầu các Smart Contract phải được cài đặt bởi quản trị viên mạng.'
      },
      sample_families: {
        title: 'Mẫu Smart Contract',
        subtitle: 'Các mô hình giao dịch cốt lõi của Hyperledger Sawtooth',
        desc: 'Vì các lập trình viên tự xây dựng smart contract (như Asset TP) cho nghiệp vụ của họ, Sawtooth cung cấp sẵn một số mẫu contract cho các hoạt động mạng lưới cấp thấp.',
        purpose: 'Mục đích',
        use_case: 'Trường hợp sử dụng',
        custom: 'Tùy chỉnh',
        asset_tp_desc: 'Bộ xử lý giao dịch tùy chỉnh được triển khai trong ứng dụng này. Nó xử lý logic để tạo và chuyển nhượng tài sản số, minh chứng cho việc logic ứng dụng được trừu tượng hóa khỏi đồng thuận.',
        list: {
          settings: {
            desc: 'Bản tham chiếu cho việc lưu trữ cấu hình mạng lưới trên chuỗi.',
            use_case: 'Thiết lập thuật toán đồng thuận, quy tắc ủy quyền và kích thước batch tối đa.'
          },
          identity: {
            desc: 'Xử lý phân quyền trên chuỗi cho người giao dịch và các khóa xác thực.',
            use_case: 'Tối ưu quản lý danh tính và danh sách khóa công khai cho mạng doanh nghiệp riêng tư.'
          },
          intkey: {
            desc: 'Dùng để kiểm tra sổ cái bằng cách thiết lập và chỉnh sửa các giá trị số nguyên đơn giản.',
            use_case: "Kiểm tra trạng thái kiểu 'Hello World' và các ứng dụng đếm đơn giản."
          },
          smallbank: {
            desc: 'Xử lý phân tích hiệu suất để đo lường và kiểm tra tải.',
            use_case: 'Dựa trên chuẩn Smallbank của H-Store để so sánh hiệu suất hệ thống blockchain.'
          },
          blockinfo: {
            desc: 'Cung cấp phương thức lưu trữ thông tin về các khối lịch sử.',
            use_case: 'Hợp đồng thông minh cần tham chiếu thời gian hoặc mã hash trạng thái từ các khối trước.'
          }
        }
      },
      crypto: {
        title: 'Demo Bảo mật & Mật mã',
        subtitle: 'Tìm hiểu các nguyên mẫu mật mã vận hành Hyperledger Sawtooth.',
        hashing_title: '1. Băm dữ liệu (SHA-512)',
        hashing_desc: 'Hàm băm là hàm một chiều ánh xạ dữ liệu kích thước bất kỳ thành chuỗi có độ dài cố định. Thử thay đổi một ký tự và quan sát sự thay đổi toàn bộ chuỗi hash (Hiệu ứng Tuyết lở).',
        input_data: 'Dữ liệu đầu vào',
        resulting_hash: 'Mã Hash kết quả (SHA-512)',
        signing_title: '2. Ký giao dịch',
        signing_desc: 'Trong Sawtooth, các giao dịch được ký bằng Khóa Riêng của người gửi sử dụng secp256k1. Điều này chứng minh người gửi đã xác nhận nội dung chính xác của giao dịch.',
        tx_payload: 'Nội dung giao dịch',
        signing_with: 'Đang ký bằng Khóa Riêng',
        gen_sig: 'Tạo chữ ký',
        sig_label: 'Chữ ký mật mã',
        verify_title: '3. Xác thực mạng lưới (Mô phỏng Validator)',
        verify_desc: 'Khi một giao dịch đến Validator, mạng lưới sẽ kiểm tra chữ ký so với nội dung và Khóa Công khai của người gửi. Hãy thử thay đổi một ký tự trong nội dung hoặc chữ ký bên dưới rồi nhấn Xác thực!',
        received_payload: 'Nội dung nhận được',
        received_sig: 'Chữ ký nhận được',
        verifying_with: 'Đang xác thực bằng Khóa Công khai',
        verify_btn: 'Xác thực tính toàn vẹn',
        valid_tx: 'Giao dịch Hợp lệ',
        invalid_tx: 'Dữ liệu bị giả mạo - Đã từ chối'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
