// @ts-nocheck
'use client'
import React, { useEffect, useState } from "react";
import {DATA_BANK} from "@/constants";
import {useParams, useRouter} from "next/navigation";
import {UserAuth, addBuktiPembelian} from "@/context/AuthContext";
import {PurchaseHistory} from "@/app/detailTransaksi/[purchaseID]/page";
import LoadingBar from "@/Components/LoadingBar";

const Order = () => {

    // const [paketData, setPaketData] = useState<PackageProps>();
    // const [dewasaData, setDewasaData] = useState<Array<{ nama: string; telp: string }>>([]);
    // const [anakData, setAnakData] = useState<Array<{ nama: string; tanggalLahir: string }>>([]);
    // const [selectedPembayaran, setSelectedValue] = React.useState('');

    const [riwayatPembelian, setRiwayatPembelian] = useState<PurchaseHistory>();
    const router = useRouter();
    const params = useParams();
    const { user } = UserAuth()
    const [isLoading, setLoading ] = useState<boolean>(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/detail_transaksi/${params.purchaseID}`);
                if (!response.ok) {
                    console.log('Failed to fetch data');
                }
                const data = await response.json();
                if (user?.uid == data.detailPembelian.UserID){
                    setRiwayatPembelian(data);
                }
            } catch (Error) {
                console.error('Error fetching data:', Error);
            } finally {
                setLoading(false)
            }
        };
        if (user != null) {
            fetchData().then();
        }
    }, [user]);


    // useEffect(() => {
    //     const data_paket = sessionStorage.getItem('selectedPackage');
    //     if (data_paket) {
    //         const parsedData = JSON.parse(data_paket);
    //         setPaketData(parsedData);
    //     }
    //
    //     const data_jamaah = sessionStorage.getItem('jamaahData')
    //     if (data_jamaah) {
    //         const parsedData = JSON.parse(data_jamaah);
    //         setDewasaData(parsedData.dewasa)
    //         setAnakData(parsedData.anak)
    //     }
    //     const metode_pembayaran = sessionStorage.getItem('pilihanPembayaran')
    //     if (metode_pembayaran) {
    //         setSelectedValue(metode_pembayaran)
    //     }
    //
    // }, []);

    const dewasaData = riwayatPembelian?.detailPembelian.detailJamaah.dewasa
    const dewasaCount = dewasaData?.length
    const anakData = riwayatPembelian?.detailPembelian.detailJamaah.anak
    const anakCount = anakData?.length
    const currentBank = DATA_BANK.find((bank) => bank.nama === riwayatPembelian?.detailPembelian.metodePembayaran);
    const paketData = riwayatPembelian?.detailPaket

    const [previewUrl, setPreviewUrl] = useState(null);
    const [file, setFile] = useState<File>()

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64URL = reader.result;
                setPreviewUrl(base64URL);
            };
            reader.readAsDataURL(selectedFile);
            setFile(selectedFile)
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            alert('No file selected');
            return;
        }
        try {
            const url = `https://google-drive-storage.solo-albayt.workers.dev/user_data/${riwayatPembelian?.detailPembelian?.email}/${riwayatPembelian?.detailPembelian?.purchaseID}.png`
            const response = await fetch(url, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type
                }
            });

            if (!response.ok) {
                console.log('Failed to upload file');
            }

            const data = await response.json();

            console.log('Upload successful:', data.id);
            await addBuktiPembelian(riwayatPembelian?.detailPembelian.purchaseID, url)
            router.push(`/detailTransaksi/${riwayatPembelian?.detailPembelian.purchaseID}`)
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div>
            {isLoading ? (<LoadingBar />) : (
                <div className="flex flex-col md:flex-row py-4 max-container padding-container">
                    <div className="md:border-r-2 lg:pl-40 md:pr-4 w-full md:w-[65%] border-opacity-50 mr-8 border-[#89060b]">
                        <div>
                            <div
                                className="border rounded border-[rgba(0,0,0,0.16)] min-h-24 mt-4 justify-center bg-white p-6 shadow">
                                <p className="font-bold text-2xl mb-4 text-[#f14310]">
                                    Silakan Transfer
                                </p>
                                <div className="flex gap-2 items-center">
                                    <img src={currentBank?.img} alt="logo-bank" className="h-7 w-7" />
                                    <p className="font-bold text-lg">{currentBank?.nama}</p>
                                </div>
                                <div className="font-medium text-xl">No Rek: {currentBank?.rekening}</div>
                            </div>
                            <div className="border rounded border-[rgba(0,0,0,0.16)] mt-4 justify-center bg-white p-6 shadow">
                                <p className="font-bold block text-2xl mb-4 text-[#f14310]">
                                    Upload Bukti Transfer
                                </p>
                                <div className="border border-gray-20 border-opacity-50 h-fit p-6 rounded-md">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg cursor-pointer"
                                    > Pilih File
                                    </label>
                                    {previewUrl && (
                                        <div className="mt-4 w-1/2">
                                            <img src={previewUrl} alt="Preview" className="mt-2 max-h-72" style={{maxWidth: '100%'}}/>
                                        </div>
                                    )}
                                </div>
                            </div>
        
                            <div className="my-8 w-full flex justify-end">
                                <button onClick={handleSubmit} className="flex bg-[#89060b] font-bold text-white w-fit rounded-lg p-4">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="sticky md:w-[40%] justify-center">
                        <div className="bg-white rounded-md text-black w-full h-fit shadow-md">
                            <div className=" text-center font-bold text-2xl my-4 pt-4 text-[#f14310]">
                                Detail Pemesanan
                            </div>
                            <p className="text-center mx-8 font-bold text-[16px] lg:text-lg mt-4 text-[#89060b]">
                                {paketData?.title}
                            </p>
                            <div className="p-4">
                                <table className="w-full border-collapse">
                                    <tbody>
                                    <tr>
                                        <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">DP
                                            Paket
                                        </td>
                                        <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">{dewasaCount + anakCount} Orang</td>
                                        <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">{paketData?.harga_dp.toLocaleString('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR'
                                        })}</td>
                                    </tr>
                                    <tr className="font-bold">
                                        <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] text-center lg:text-[16px]"
                                            colSpan={2}>Total Biaya
                                        </td>
                                        <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">{((paketData?.harga_dp ?? 0) * (dewasaCount + anakCount)).toLocaleString('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR'
                                        })}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-white rounded-md text-black w-full h-fit shadow-md">
                            <div className=" text-center font-bold text-2xl my-4 pt-4 text-[#f14310]">
                                Detail Jamaah
                            </div>
                            <div className={"pl-4"}>
                                <div className="px-4 pb-4">
                                    <p className={"font-bold"}>Dewasa</p>
                                    <table className="w-full border-collapse mb-4">
                                        <tbody>
                                        {dewasaData?.map((person) => (
                                            <tr key={person.nama}>
                                                <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">{person.nama}</td>
                                                <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">{person.telp}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    <p className={"font-bold"}>Anak-anak</p>
                                    <table className="w-full border-collapse">
                                        <tbody>
                                        {anakData?.map((person) => (
                                            <tr key={person.nama}>
                                                <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">{person.nama}</td>
                                                <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">{person.tgl_lahir}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default Order;
