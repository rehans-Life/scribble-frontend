import Footer from "@/components/footer";
import RoomForm from "@/components/room-form";

export default function Home() {
  return (
    <div className="justify-between min-h-screen">
      <RoomForm></RoomForm>
      <Footer />
    </div>
  );
}
